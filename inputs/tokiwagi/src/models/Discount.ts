export type DiscountSettingItem = {
  threshold: number;
  adultDiscountAmount: number;
  adultSmaregiQRCodeUrl?: string | File;
  adultObicCode?: string;
  childDiscountAmount: number;
  childSmaregiQRCodeUrl?: string | File;
  childObicCode?: string;
}

export type HourlyExtraTimeDiscountSetting = {
  enable: boolean;
  setting: DiscountSettingItem[];
}

export type HourlyExtraTimeInfo = {
  adultQuantity: number;
  childQuantity: number;
  numberOfExtraTimeBlocks: number;
}

export type HourlyExtraTimeInfos = Record<string, HourlyExtraTimeInfo[]>;

export type DiscountInfo = {
  adultDiscountAmount: number;
  adultDiscountDetails: Record<number, number>;
  childDiscountAmount: number;
  childDiscountDetails: Record<number, number>;
  total: number;
}

export type PriceItem = {
  quantity: number;
  price: number;
  amount: number;
};

export type HourlyExtraTimeDiscountDetail = {
  order: number;
  numberOfExtraTimeBlocks: number;
  discountSetting?: number;
  discountAmount?: number;
}
