namespace my.bookshop;

entity GetPendingInvoiceList {
  key PONumber : String;
  PODate  : String;
  VendorCode  : String;
  VendorName: String;
  PlantCode: String;
  PlantName: String;
  POTotalAmount: String;
  POTotalQuantity: String;
  MRNNumber: String;
  MRNDate: String;
  MRNQuantity: String;
  MRNQuantityReceived: String;
  MRNQuantityReceivedLocation: String;
  InvoiceStatus: String;
}

entity GetPoDetailstoCreateInvoice {
  key PONumber : String;
  PODate  : String;
  VendorCode  : String;
  VendorName: String;
  VendorAddress: String;
  VendorPhoneNumber: String;
  VendorEMail: String;
  VendorGstNumber: String;
  VendorPanNumber: String;
  VendorMSMEIndiactor: String;
  MRNnumber: String;
  MRNDate: String;
  MRNDeliveryLocation: String;
  TotalMRNAmountAsperPO: String;
  TotalMRNQuantity: String;
  DocumentRows  : Composition of many DocumentRowItems
                        on DocumentRows.PNum = $self;
}

entity DocumentRowItems{
  ItemNumber: String;
  MaterialCode: String;
  MaterialDescription: String;
  BatchNumber: String;
  QuantityReceived: String;
  UOM: String;
  POAmount: String;
  TaxAmount: String;
  OtherCharges: String;
  FrieghtAmount: String;
  Packing: String;
  PNum          : Association to GetPoDetailstoCreateInvoice;
}