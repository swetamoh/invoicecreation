namespace my.bookshop;

entity GetPendingInvoiceList {
  key PONumber                    : String;
      PODate                      : String;
      VendorCode                  : String;
      VendorName                  : String;
      PlantCode                   : String;
      PlantName                   : String;
      POTotalAmount               : String;
      POTotalQuantity             : String;
      MRNNumber                   : String;
      MRNDate                     : String;
      MRNQuantity                 : String;
      MRNCurrency                 : String;
      MRNQuantityReceived         : String;
      MRNQuantityRejected         : String;
      MRNQuantityReceivedLocation : String;
      ASNQuantity                 : String;
      InvoiceStatus               : String;
}

entity GetPoDetailstoCreateInvoice {
  key PONumber              : String;
      PODate                : String;
      VendorCode            : String;
      VendorName            : String;
      VendorAddress         : String;
      VendorPhoneNumber     : String;
      VendorEMail           : String;
      VendorGstNumber       : String;
      VendorPanNumber       : String;
      VendorMSMEIndiactor   : String;
      MRNnumber             : String;
      MRNDate               : String;
      MRNCreatedBy          : String;
      MRNDeliveryLocation   : String;
      TotalMRNAmountAsperPO : String;
      TotalMRNQuantity      : String;
      DocumentRows          : Composition of many DocumentRowItems
                                on DocumentRows.PNum = $self;
}

entity DocumentRowItems {
  UnitCode                : String;
  TRNCode                 : String;
  MRNNumber               : String;
  MRNLineNumber           : String;
  MaterialCode            : String;
  MaterialDescription     : String;
  ItemNumber              : String;
  ItemGroupCode           : String;
  GroupAccountCode        : String;
  GroupAccountDescription : String;
  ItemRate                : String;
  ItemUOM                 : String;
  AcceptedQty             : String;
  RejectedQty             : String;
  ActualQty               : String;
  InvoiceQty              : String;
  TRNLineNumber           : String;
  TRNType                 : String;
  HSNCode                 : String;
  MaterialValue           : String;
  IGP                     : String;
  CGP                     : String;
  SGP                     : String;
  CDT                     : String;
  CRT                     : String;
  IGA                     : String;
  CGA                     : String;
  SGA                     : String;
  Packing                 : String;
  Freight                 : String;
  Others                  : String;
  ExchangeRate            : String;
  FrieghtOrg              : String;
  OtherOrg                : String;
  PakingOrg               : String;
  FRMyear                 : String;
  TCS                     : String;
  InvoiceRate             : String;
  CurrPORate              : String;
  CurrencyCode            : String;
  TaxPercentage           : String;
  Tax                     : String;
  MRNLineValue            : String;
  POLineValue             : String;
  InvoiceStatus           : String;
  BatchNumber             : String;
  PNum                    : Association to GetPoDetailstoCreateInvoice;
}
