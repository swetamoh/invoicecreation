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
      MRNQuantityReceived         : String;
      MRNQuantityReceivedLocation : String;
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
  ItemNumber          : String;
  MaterialCode        : String;
  MaterialDescription : String;
  BatchNumber         : String;
  ItemRate            : String;
  MRNQty              : String;
  QuantityReceived    : String;
  RejectedQty         : String;
  UOM                 : String;
  Currency            : String;
  POAmount            : String;
  OtherCharges        : String;
  FrieghtAmount       : String;
  Packing             : String;
  TaxPercentage       : String;
  TaxAmount           : String;
  MRNLineValue        : String;
  InvoiceStatus       : String;
  PNum                : Association to GetPoDetailstoCreateInvoice;
}
