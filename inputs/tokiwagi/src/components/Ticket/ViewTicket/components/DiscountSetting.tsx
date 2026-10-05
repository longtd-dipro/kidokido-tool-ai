import { DiscountSettingItem } from "models/Discount";

import SmaregiQRCode from "./SmaregiQRCode";

interface Props {
  items: DiscountSettingItem[];
  isEnabledSmaregi: boolean;
}

export default function DiscountSetting({ items, isEnabledSmaregi }: Props) {
  if (isEnabledSmaregi) {
    return (
      <div className="flex flex-col gap-4">
        {items.map((setting, index) => (
          <div key={index}>
            <div className="flex items-stretch mdonly:flex-col mdonly:items-start gap-5 mdonly:gap-4">
              <div className="flex items-center mdonly:min-w-[180px] border-r mdonly:border-0 mdonly:p-0 pr-5">
                <span>{setting.threshold}枚目の購入に対する割引</span>
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex gap-[13px] items-center py-2">
                  <span className="min-w-[120px] mdonly:min-w-[100px]">
                    おとな: {setting.adultDiscountAmount}円
                  </span>
                  {setting.adultSmaregiQRCodeUrl && (
                    <SmaregiQRCode
                      src={setting.adultSmaregiQRCodeUrl as string}
                      alt="Adult Smaregi QR Code"
                    />
                  )}
                  <span className="min-w-[120px] mdonly:min-w-[100px]">
                    OBIC: {setting.adultObicCode}
                  </span>
                </div>
                <div className="flex gap-[13px] items-center py-2 border-t">
                  <span className="min-w-[120px] mdonly:min-w-[100px]">
                    子ども: {setting.childDiscountAmount}円
                  </span>
                  {setting.childSmaregiQRCodeUrl && (
                    <SmaregiQRCode
                      src={setting.childSmaregiQRCodeUrl as string}
                      alt="Child Smaregi QR Code"
                    />
                  )}
                  <span className="min-w-[120px] mdonly:min-w-[100px]">
                    OBIC: {setting.childObicCode}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {items.map((setting, index) => (
        <div key={index}>
          <div className="flex gap-14 mdonly:gap-8">
            <span className="min-w-[200px] mdonly:min-w-[180px]">
              {setting.threshold}枚目の購入に対する割引
            </span>
            <div className="mdonly:min-w-[180px]">
              <div className="flex gap-[13px] items-center py-2">
                <span className="min-w-[120px] mdonly:min-w-[100px]">
                  おとな: {setting.adultDiscountAmount}円
                </span>
                <span className="min-w-[120px] mdonly:min-w-[100px]">
                  OBIC: {setting.adultObicCode}
                </span>
              </div>
              <div className="flex gap-[13px] items-center py-2 border-t">
                <span className="min-w-[120px] mdonly:min-w-[100px]">
                  子ども: {setting.childDiscountAmount}円
                </span>
                <span className="min-w-[120px] mdonly:min-w-[100px]">
                  OBIC: {setting.childObicCode}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
