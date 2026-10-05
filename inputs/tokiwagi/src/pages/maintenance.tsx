export default function Maintenance() {
  return (
    <div className="user text-color min-h-[100vh] flex flex-col">
      <section className="relative text-gray-600 body-font mx-auto">
        <div className="flex flex-col justify-center px-5 pt-20 pb-2 mx-auto">
          <div>いつもキドキド・プレイヴィル・プレイロットをご利用いただき、誠にありがとうございます。</div>
          <div>現在、より快適にご利用いただくためのシステムメンテナンスを実施しております。</div>
        </div>
        <div className="flex flex-col justify-center px-5 py-2 mx-auto text-red-color">
          ■作業予定時間：2月13日（木）19:00～ 23:00
        </div>
        <div className="flex flex-col justify-center px-5 py-2 mx-auto">
          <div>メンテナンス中は当サービスをご利用いただけません。</div>
          <div>作業の進捗状況によっては、予定時間を超えてしまう可能性がございます。</div>
          <div>お客様にはご不便をおかけしますがご理解賜りますようお願い申し上げます。</div>
        </div>
      </section>
    </div>
  );
}
