import { orderBy, groupBy, isObject, isNil } from "lodash";
import { PriceUnit, TicketType } from "@prisma/client";
import moment from "moment/moment";

import { Booking, Ticket } from "models/Entity";
import {
  DiscountInfo,
  HourlyExtraTimeInfo,
  HourlyExtraTimeInfos,
  PriceItem,
  DiscountSettingItem,
  HourlyExtraTimeDiscountSetting,
  HourlyExtraTimeDiscountDetail
} from "models/Discount";
import { BookingFormData } from "components/CreateBooking/PaymentOfflineBookingForm";
import { PriceInfo } from "models/Booking";
import { getTicketBookingSchedule } from "utils/ticket";
import { getSafeNumberValue } from "utils/number";
import {
  isHourlyTicket,
  isCancelledBooking,
  isOfflineOneDayTicket,
  isOnlineMonthlyTicket,
  isOnlineOneDayTicket,
  isOnlineTimesLimitTicket
} from "utils/booking";

export const START_DISCOUNT_THRESHOLD = 2;

export const normalizeBookings = (bookings: Booking[] | BookingFormData[]) => bookings.map(normalizeBooking);

export const normalizeBooking = (booking: any): Booking => {
  if (isObject(booking.ticketId)) {
    return {
      ...booking,
      Ticket: booking.ticketId,
      ticketId: booking.ticketId.id
    };
  } else {
    return { ...booking };
  }
};

export const calculateDiscountForSameBarCodeBookings = (bookings: Booking[]) => {
  const bookingsByTicket = groupBy(bookings, "ticketId");

  const result = { total: { adultDiscountAmount: 0, childDiscountAmount: 0 } };
  Object.keys(bookingsByTicket).forEach(ticketId => {
    let byTicketBookings = bookingsByTicket[ticketId];
    if (byTicketBookings.every(booking => !!booking.id)) {
      byTicketBookings = orderBy(byTicketBookings, ["id"], ["asc"]);
    }
    const discount = calculateDiscountForTicket(byTicketBookings);
    result[ticketId] = discount;
    result.total.adultDiscountAmount += discount.adultDiscountAmount;
    result.total.childDiscountAmount += discount.childDiscountAmount;
  });
  return result;
};

export const calculateDiscountForTicket = (bookings: Booking[]) => {
  let adultDiscountAmount = 0;
  let childDiscountAmount = 0;

  const ticket = bookings[0]?.Ticket;
  const bookingDate = bookings[0]?.date;

  if (isEnableDiscountTicket(ticket)) {
    let totalAdult = 0;
    let totalChild = 0;

    // Calculate total adult & child
    bookings.forEach(booking => {
      totalAdult += booking.adultQuantity;
      totalChild += booking.childQuantity;
    });

    const discount = calculateDiscountByQuantity(totalAdult, totalChild, ticket, bookingDate);
    adultDiscountAmount = discount.adultDiscountAmount;
    childDiscountAmount = discount.childDiscountAmount;
  }

  return { adultDiscountAmount, childDiscountAmount };
};

export const getTicketPrice = (ticket: Ticket, bookingDate: Date | string = new Date()) => {
  let baseAdultPrice = 0;
  let baseChildPrice = 0;
  let extendedAdultPrice = 0;
  let extendedChildPrice = 0;

  if (isOnlineMonthlyTicket(ticket)) {
    const { adultPrice = 0, childPrice = 0 } = ticket?.TicketDetail || {};
    baseAdultPrice = getSafeNumberValue(adultPrice);
    baseChildPrice = getSafeNumberValue(childPrice);
  } else if (isOnlineOneDayTicket(ticket) || isOfflineOneDayTicket(ticket)) {
    const bookingSchedule = getTicketBookingSchedule(bookingDate, ticket);
    const { baseAdultPeriodPrice = 0, baseChildPeriodPrice = 0 } = bookingSchedule || {};
    baseAdultPrice = getSafeNumberValue(baseAdultPeriodPrice);
    baseChildPrice = getSafeNumberValue(baseChildPeriodPrice);
  } else if (isHourlyTicket(ticket)) {
    const bookingSchedule = getTicketBookingSchedule(bookingDate, ticket);
    const {
      baseAdultPeriodPrice = 0,
      baseChildPeriodPrice = 0,
      extendedAdultPeriodPrice = 0,
      extendedChildPeriodPrice = 0
    } = bookingSchedule || {};
    baseAdultPrice = getSafeNumberValue(baseAdultPeriodPrice);
    baseChildPrice = getSafeNumberValue(baseChildPeriodPrice);
    extendedAdultPrice = getSafeNumberValue(extendedAdultPeriodPrice);
    extendedChildPrice = getSafeNumberValue(extendedChildPeriodPrice);
  }

  return {
    baseAdultPrice,
    baseChildPrice,
    extendedAdultPrice,
    extendedChildPrice,
  };
};

export const calculateDiscountByQuantity = (
  adultQuantity: number,
  childQuantity: number,
  ticket: Ticket,
  bookingDate?: Date | string,
  accumulativeAdultQuantity: number = 0,
  accumulativeChildQuantity: number = 0): DiscountInfo => {
  let adultDiscountAmount = 0;
  let adultDiscountDetails = {};
  let childDiscountAmount = 0;
  let childDiscountDetails = {};

  if (isEnableDiscountTicket(ticket)) {
    let settingItems = ticket.TicketDiscountSetting?.setting as DiscountSettingItem[];
    settingItems = orderBy(settingItems, ["threshold"], ["asc"]);

    const { baseAdultPrice, baseChildPrice } = getTicketPrice(ticket, bookingDate);

    // Calculate discount amount for adult
    for (let quantity = 1; quantity <= adultQuantity; quantity++) {
      const discountSetting = getDiscountSettingByQuantity(quantity + accumulativeAdultQuantity, settingItems);
      if (discountSetting) {
        const discount = Math.min(baseAdultPrice, discountSetting.adultDiscountAmount);
        adultDiscountAmount += discount;
        adultDiscountDetails[quantity] = discount;
      } else {
        adultDiscountDetails[quantity] = 0;
      }
    }

    // Calculate discount amount for child
    for (let quantity = 1; quantity <= childQuantity; quantity++) {
      const discountSetting = getDiscountSettingByQuantity(quantity + accumulativeChildQuantity, settingItems);
      if (discountSetting) {
        const discount = Math.min(baseChildPrice, discountSetting.childDiscountAmount);
        childDiscountAmount += discount;
        childDiscountDetails[quantity] = discount;
      } else {
        childDiscountDetails[quantity] = 0;
      }
    }
  }

  return {
    adultDiscountAmount,
    adultDiscountDetails,
    childDiscountAmount,
    childDiscountDetails,
    total: adultDiscountAmount + childDiscountAmount
  };
};

export const calculateExtraTimeDiscountForTicket = (
  hourlyBookings: Booking[],
  hourlyExtraTimeInfos: HourlyExtraTimeInfos,
  extendedPriceOverride?: { adult: number; child: number },
) => {
  let ticketAdultDiscountAmount = 0;
  let ticketChildDiscountAmount = 0;
  let adultDiscountDetails: HourlyExtraTimeDiscountDetail[];
  let childDiscountDetails: HourlyExtraTimeDiscountDetail[];

  const ticketBooking = hourlyBookings[0];
  const ticket = ticketBooking?.Ticket;
  if (isEnableExtraTimeDiscountHourlyTicket(ticket)) {
    const hourlyExtraTimeSetting = ticket.TicketDiscountSetting?.hourlyExtraTimeSetting as HourlyExtraTimeDiscountSetting;
    let settingItems = hourlyExtraTimeSetting?.setting as DiscountSettingItem[];
    settingItems = orderBy(settingItems, ["threshold"], ["asc"]);
    const { extendedAdultPrice: fetchedAdult, extendedChildPrice: fetchedChild } = getTicketPrice(ticket, ticketBooking.date);
    const extendedAdultPrice = extendedPriceOverride?.adult ?? fetchedAdult;
    const extendedChildPrice = extendedPriceOverride?.child ?? fetchedChild;

    let ticketHourlyExtraTimeInfos = [];
    hourlyBookings.forEach(booking => {
      ticketHourlyExtraTimeInfos = ticketHourlyExtraTimeInfos.concat(hourlyExtraTimeInfos[booking.id]);
    });

    ticketHourlyExtraTimeInfos = orderBy(ticketHourlyExtraTimeInfos, ["numberOfExtraTimeBlocks"], ["desc"]);

    const { adultOrderAndExtraTimeBlocks, childOrderAndExtraTimeBlocks } = extractOrderAndNumberOfExtraTimeBlocks(ticketHourlyExtraTimeInfos);

    adultOrderAndExtraTimeBlocks.forEach(item => {
      const discountSetting = getDiscountSettingByQuantity(item.order, settingItems);
      if (discountSetting) {
        const discount = Math.min(extendedAdultPrice, discountSetting.adultDiscountAmount);
        const discountAmount = discount * item.numberOfExtraTimeBlocks;
        ticketAdultDiscountAmount += discountAmount;
        item.discountSetting = discount;
        item.discountAmount = discountAmount;
      }
    });

    childOrderAndExtraTimeBlocks.forEach(item => {
      const discountSetting = getDiscountSettingByQuantity(item.order, settingItems);

      if (discountSetting) {
        const discount = Math.min(extendedChildPrice, discountSetting.childDiscountAmount);
        const discountAmount = discount * item.numberOfExtraTimeBlocks;
        ticketChildDiscountAmount += discountAmount;
        item.discountSetting = discount;
        item.discountAmount = discountAmount;
      }
    });

    adultDiscountDetails = adultOrderAndExtraTimeBlocks;
    childDiscountDetails = childOrderAndExtraTimeBlocks;
  }

  return {
    adultDiscountAmount: ticketAdultDiscountAmount,
    childDiscountAmount: ticketChildDiscountAmount,
    adultDiscountDetails,
    childDiscountDetails
  };
};

export const extractOrderAndNumberOfExtraTimeBlocks = (ticketHourlyExtraTimeInfos: HourlyExtraTimeInfo[]) => {
  let adultOrder = 1;
  let childOrder = 1;
  let adultOrderAndExtraTimeBlocks: HourlyExtraTimeDiscountDetail[] = [];
  let childOrderAndExtraTimeBlocks: HourlyExtraTimeDiscountDetail[] = [];
  ticketHourlyExtraTimeInfos.forEach(item => {
    if (item) {
      for (let i = 0; i < item.adultQuantity; i++) {
        adultOrderAndExtraTimeBlocks.push({
          order: adultOrder,
          numberOfExtraTimeBlocks: item.numberOfExtraTimeBlocks,
        });
        adultOrder++;
      }

      for (let i = 0; i < item.childQuantity; i++) {
        childOrderAndExtraTimeBlocks.push({
          order: childOrder,
          numberOfExtraTimeBlocks: item.numberOfExtraTimeBlocks
        });
        childOrder++;
      }
    }
  });

  return { adultOrderAndExtraTimeBlocks, childOrderAndExtraTimeBlocks };
};

export const calculateHourlyExtraTimeDiscountForSameBarCodeBookings = (hourlyBookings: Booking[], hourlyExtraTimeInfos: HourlyExtraTimeInfos) => {
  const bookingsByTicket = groupBy(hourlyBookings, "ticketId");

  const result = { total: { adultDiscountAmount: 0, childDiscountAmount: 0 } };
  Object.keys(bookingsByTicket).forEach(ticketId => {
    let byTicketBookings = bookingsByTicket[ticketId];
    if (byTicketBookings.every(booking => !!booking.id)) {
      byTicketBookings = orderBy(byTicketBookings, ["id"], ["asc"]);
    }
    const discount = calculateExtraTimeDiscountForTicket(byTicketBookings, hourlyExtraTimeInfos);
    result[ticketId] = discount;
    result.total.adultDiscountAmount += discount.adultDiscountAmount;
    result.total.childDiscountAmount += discount.childDiscountAmount;
  });
  return result;
};

const getDiscountSettingByQuantity = (quantity: number, settingItems: DiscountSettingItem[]) => {
  if (!settingItems || settingItems.length === 0) {
    return null;
  }
  let selectedSettingItem: DiscountSettingItem;
  const minThresholdSettingItem = settingItems[0];
  const maxThresholdSettingItem = settingItems[settingItems.length - 1];

  if (quantity < minThresholdSettingItem.threshold) {
    selectedSettingItem = null;
  } else if (quantity > maxThresholdSettingItem.threshold) {
    selectedSettingItem = maxThresholdSettingItem;
  } else {
    for (let i = 0; i < settingItems.length; i++) {
      const settingItem = settingItems[i];
      if (quantity >= settingItem.threshold) {
        selectedSettingItem = settingItem;
      } else {
        break;
      }
    }
  }

  return selectedSettingItem;
};

export const calculateNumberOfExtraTimeBlocks = (totalUsageTime: number, priceInfo: PriceInfo) => {
  if (priceInfo.basePeriodUnit === PriceUnit.Day) {
    return 0;
  }

  const basePeriod = priceInfo.basePeriodUnit === PriceUnit.Hour ? priceInfo.basePeriod * 60 : priceInfo.basePeriod;
  const extendedPeriod = priceInfo.extendedPeriodUnit === PriceUnit.Hour ? priceInfo.extendedPeriod * 60 : priceInfo.extendedPeriod;

  if (totalUsageTime <= basePeriod) {
    return 0;
  }
  let extendedUsageTime = totalUsageTime - basePeriod;
  if (extendedUsageTime < 0) extendedUsageTime = 0;

  let numberOfBlocks = Math.ceil(extendedUsageTime / extendedPeriod);

  if (!priceInfo.extendedPeriod) {
    numberOfBlocks = 0;
  }

  return numberOfBlocks;
};

export const isEnableDiscountTicket = (ticket: Ticket) => {
  const settingItems = ticket?.TicketDiscountSetting?.setting as DiscountSettingItem[];
  const enableDiscount = ticket?.TicketDetail?.enableDiscount;
  return !!(enableDiscount && settingItems?.length > 0);
};

export const isEnableExtraTimeDiscountHourlyTicket = (ticket: Ticket) => {
  const isHourlyTicket = ticket?.type === TicketType.Hourly;
  const hourlyExtraTimeSetting = ticket?.TicketDiscountSetting?.hourlyExtraTimeSetting as HourlyExtraTimeDiscountSetting;
  const settingItems = hourlyExtraTimeSetting?.setting;
  const enableDiscount = hourlyExtraTimeSetting?.enable;
  return isHourlyTicket && enableDiscount && settingItems?.length > 0;
};

export const generateUseInDayBookingsWithDiscount = (bookings: BookingFormData[] | Booking[], dummyBookings?: Booking[]) => {
  dummyBookings = dummyBookings || [];
  const totalBookings = dummyBookings.concat(bookings as any[]);
  let bookingsByTicket = groupBy(normalizeBookings(totalBookings), "ticketId");

  let useInDayWithDiscountBookings: Booking[] = [];
  const useInDayWithDiscountBookingsPriceListMap: Record<number, {
    adultPriceList: PriceItem[];
    childPriceList: PriceItem[];
    totalOriginalAmount: number;
    adultDiscountAmount: number;
    childDiscountAmount: number;
    totalDiscount: number;
    totalAmountAfterDiscount: number
    ticketType: string;
  }> = {};

  // Calculate discount for each ticket
  let fakeBookingIdIndex = -1;
  Object.keys(bookingsByTicket).forEach(ticketId => {
    let accumulativeAdultQuantity = 0;
    let accumulativeChildQuantity = 0;
    let byTicketBookings = bookingsByTicket[ticketId];
    if (byTicketBookings.every(booking => !!booking.id)) {
      byTicketBookings = orderBy(byTicketBookings, ["id"], ["asc"]);
    }
    for (let i = 0; i < byTicketBookings.length; i++) {
      const booking = byTicketBookings[i];
      const ticket = booking.Ticket;
      if (!ticket) continue;

      const adultPriceList: PriceItem[] = [];
      const childPriceList: PriceItem[] = [];
      let totalOriginalAmount = 0;
      let adultDiscountAmount = 0;
      let childDiscountAmount = 0;
      let totalDiscount = 0;
      let totalAmountAfterDiscount = 0;
      const adultQuantity = booking.adultQuantity;
      const childQuantity = booking.childQuantity;

      if (isOnlineMonthlyTicket(ticket) || isOnlineTimesLimitTicket(ticket)) {
        // The daily booking for monthly ticket is free, so the price is always 0
        adultPriceList.push({
          quantity: adultQuantity,
          price: 0,
          amount: 0
        });
        childPriceList.push({
          quantity: childQuantity,
          price: 0,
          amount: 0
        });
        totalOriginalAmount = 0;
        totalDiscount = 0;
        totalAmountAfterDiscount = 0;
      } else {
        // Populate discount info from one day offline booking
        const bookingSchedule = booking.TicketBookingSchedule || getTicketBookingSchedule(booking.date || moment().toISOString(), ticket);
        const adultPrice = isNil(bookingSchedule?.baseAdultPeriodPrice) ? 0 : +bookingSchedule?.baseAdultPeriodPrice;
        const childPrice = isNil(bookingSchedule?.baseChildPeriodPrice) ? 0 : +bookingSchedule?.baseChildPeriodPrice;

        if (isEnableDiscountTicket(ticket)) {
          // If discount is enable
          const discountInfo = calculateDiscountByQuantity(adultQuantity,
            childQuantity, ticket, booking.date, accumulativeAdultQuantity, accumulativeChildQuantity);
          const { adultDiscountDetails = {}, childDiscountDetails = {} } = discountInfo || {};
          // Calculate price after discount for each person
          if (adultQuantity === 0) {
            adultPriceList.push({
              quantity: 0,
              price: adultPrice,
              amount: 0
            });
          } else {
            Array(adultQuantity).fill(0).forEach((item, index) => {
              const order = index + 1;
              // Do not apply discount for cancelled booking
              const discount = isCancelledBooking(booking) ? 0 : (adultDiscountDetails[order] || 0);
              const price = adultPrice - discount;
              adultPriceList.push({
                quantity: 1,
                price,
                amount: price
              });

              totalOriginalAmount += adultPrice;
              adultDiscountAmount += discount;
              totalDiscount += discount;
            });
          }

          if (childQuantity === 0) {
            childPriceList.push({
              quantity: 0,
              price: childPrice,
              amount: 0
            });
          } else {
            Array(childQuantity).fill(0).forEach((item, index) => {
              const order = index + 1;
              // Do not apply discount for cancelled booking
              const discount = isCancelledBooking(booking) ? 0 : (childDiscountDetails[order] || 0);
              const price = childPrice - discount;
              childPriceList.push({
                quantity: 1,
                price,
                amount: price
              });

              totalOriginalAmount += childPrice;
              childDiscountAmount += discount;
              totalDiscount += discount;
            });
          }

          totalAmountAfterDiscount = totalOriginalAmount - totalDiscount;
        } else {
          // If discount is disable then get original price
          adultPriceList.push({
            quantity: adultQuantity,
            price: adultPrice,
            amount: adultPrice * adultQuantity
          });
          childPriceList.push({
            quantity: childQuantity,
            price: childPrice,
            amount: childPrice * childQuantity
          });
          totalOriginalAmount += (adultPrice * adultQuantity) + (childPrice * childQuantity);
          totalDiscount = 0;
          totalAmountAfterDiscount = totalOriginalAmount;
        }
      }

      if (isNil(booking.id)) {
        booking.id = fakeBookingIdIndex;
        fakeBookingIdIndex--;
      }

      useInDayWithDiscountBookingsPriceListMap[booking.id] = {
        adultPriceList,
        childPriceList,
        totalOriginalAmount,
        adultDiscountAmount,
        childDiscountAmount,
        totalDiscount,
        totalAmountAfterDiscount,
        ticketType: ticket.type
      };

      useInDayWithDiscountBookings.push(booking);

      // Do not count child|adult quantity from cancelled bookings
      accumulativeAdultQuantity += isCancelledBooking(booking) ? 0 : booking.adultQuantity;
      accumulativeChildQuantity += isCancelledBooking(booking) ? 0 : booking.childQuantity;
    }
  });

  // remove info of involved bookings in results
  useInDayWithDiscountBookings = useInDayWithDiscountBookings
    .filter(b => !dummyBookings.find(involvedBooking => involvedBooking.id === b.id));

  dummyBookings.forEach(booking => {
    delete useInDayWithDiscountBookingsPriceListMap[booking.id];
  });

  return { useInDayWithDiscountBookings, useInDayWithDiscountBookingsPriceListMap };
};

export const getUseInDayBookingAmount = (booking: Booking, sameBarcodeBookings?: Booking[]) => {
  let amount = 0;
  if (+booking.totalAmount) {
    amount = +booking.totalAmount;
  } else {
    if (!isCancelledBooking(booking) && sameBarcodeBookings) {
      const sameTicketBookings = sameBarcodeBookings.filter(b => b.ticketId == booking.ticketId && !isCancelledBooking(b));
      // Augment ticket with discount setting info for the same ticket bookings
      sameTicketBookings.forEach(b => {
        b.Ticket = booking.Ticket;
      });

      const { useInDayWithDiscountBookingsPriceListMap } = generateUseInDayBookingsWithDiscount(sameTicketBookings);
      const bookingPriceList = useInDayWithDiscountBookingsPriceListMap[booking.id];
      return bookingPriceList?.totalAmountAfterDiscount;
    } else {
      amount = getUseInDayBookingOriginalAmount(booking);
    }
  }

  return amount;
};

export const getUseInDayBookingOriginalAmount = (booking: Booking) => {
  const bookingSchedule = booking.TicketBookingSchedule;
  const adultPrice = isNil(bookingSchedule?.baseAdultPeriodPrice) ? 0 : +bookingSchedule?.baseAdultPeriodPrice;
  const childPrice = isNil(bookingSchedule?.baseChildPeriodPrice) ? 0 : +bookingSchedule?.baseChildPeriodPrice;
  return booking.adultQuantity * adultPrice + booking.childQuantity * childPrice;
};
