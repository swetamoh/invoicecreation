sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/export/Spreadsheet",
	"sap/ui/export/library",
	"sap/m/MessageBox"
], function (Controller, Spreadsheet, exportLibrary, MessageBox) {
	"use strict";

	return Controller.extend("sap.fiori.invoicecreation.controller.ASNReportView", {

		onInit: function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.DataModel = new sap.ui.model.json.JSONModel();
			this.DataModel.setSizeLimit(10000000);
			this.getView().setModel(this.DataModel, "DataModel");
			this.detailModel = sap.ui.getCore().getModel("detailModel");
			this.loginModel = sap.ui.getCore().getModel("loginModel");
			this.getView().setModel(this.loginModel, "loginModel");
			this.localModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.localModel, "localModel");
			this._tableTemp = this.getView().byId("tableTempId").clone();
			// this.StatusModel = new sap.ui.model.json.JSONModel();
			// this.getView().setModel(this.StatusModel, "StatusModel");
			// this.StatusFlag = false;
			this.oDataModel = sap.ui.getCore().getModel("oDataModel");
			this.getView().setModel(this.oDataModel);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMdd"
			});
			// this.curDate = new Date();
			// this.startDate = new Date(this.curDate.getTime() - 30 * 24 * 3600 * 1000);
			// this.getView().byId("endDateId").setMinDate(this.startDate);
			// this.curDate = dateFormat.format(this.curDate);
			// this.startDate = dateFormat.format(this.startDate);
			// this.getView().byId("endDateId").setValue(this.curDate);
			// this.getView().byId("startDateId").setValue(this.startDate);
			// this.searhFilters = this.statusFilters = [];
			// var that = this;
			// this.oDataModel.read("/AsnSet?$filter=(StartDate eq '" + this.startDate + "'and EndDate eq '" + this.curDate + "')", null, null,
			// 	false,
			// 	function (oData) {
			// 		that.DataModel.setData(oData);
			// 		that.DataModel.refresh();
			// 	},
			// 	function (oError) {
			// 		sap.ui.core.BusyIndicator.hide();
			// 		var value = JSON.parse(oError.response.body);
			// 		MessageBox.error(value.error.message.value);
			// 	}
			// );
			this.curDate = new Date();
			//this.endDate = new Date(this.curDate.getTime() + 30 * 24 * 3600 * 1000);
			//this.getView().byId("endDateId").setMinDate(this.curDate);
			this.curDate = dateFormat.format(this.curDate);
			//this.endDate = dateFormat.format(this.endDate);
			//this.getView().byId("endDateId").setValue(this.curDate);
			//this.getView().byId("startDateId").setValue(this.curDate);
			//this.searhFilters = this.statusFilters = [];
			var that = this;
			this.unitCode = sessionStorage.getItem("unitCode") || "P01";
			this.getView().byId("PlantId").setValue(this.unitCode);
			this.getView().byId("InvStatusId").setSelectedKey("PENDING FOR BILL PASSING");
			this.InvStatus = this.getView().byId("InvStatusId").getSelectedKey();
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/GetPendingInvoiceList", {
				urlParameters: {
					UnitCode: this.unitCode,
					PoNum: '',
					MrnNumber: '',
					FromPOdate: '',
					ToPOdate: '',
					FromMrndate: '',
					ToMrndate: '',
					Status: this.InvStatus
				},
				success: function (oData) {
					that.DataModel.setData(oData);
					that.DataModel.refresh();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					//var value = JSON.parse(oError.response.body);
					//MessageBox.error(value.error.message.value);
					//MessageBox.error(oError.message);
				}
			});

			//var datePicker = this.getView().byId("startDateId");

			// datePicker.addDelegate({
			// 	onAfterRendering: function () {
			// 		datePicker.$().find('INPUT').attr('disabled', true).css('color', '#000000');
			// 	}
			// }, datePicker);

			// datePicker = this.getView().byId("endDateId");

			// datePicker.addDelegate({
			// 	onAfterRendering: function () {
			// 		datePicker.$().find('INPUT').attr('disabled', true).css('color', '#000000');
			// 	}
			// }, datePicker);
		},
		onFilterClear: function () {
			var data = this.localModel.getData();
			data.PONum = "";
			data.MRNNumber = "";
			data.POStartDate = "";
			data.POEndDate = "";
			data.MRNStartDate = "";
			data.MRNEndDate = "";
			this.localModel.refresh(true);
			 var oView = this.getView();
			oView.byId("poNumId").setValue("");
			oView.byId("MrnNumId").setValue("");
			oView.byId("postartDateId").setValue("");
			oView.byId("poendDateId").setValue("");
			oView.byId("mrnstartDateId").setValue("");
			oView.byId("mrnendDateId").setValue("");
		},

		onFilterGoPress: function () {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var data = this.localModel.getData();
			var oModel = this.getOwnerComponent().getModel();
			var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "ddMMMyyyy"
			});
			
			this.POEndDate = this.getView().byId("poendDateId").getDateValue();
			this.POStartDate = this.getView().byId("postartDateId").getDateValue();
			if(this.POEndDate){
				this.POEndDate = dateFormat1.format(this.POEndDate);
				this.POEndDate = this.POEndDate.substring(0, 2) + " " + this.POEndDate.substring(2, 5) + " " + this.POEndDate.substring(5, 9);
			}
			if(this.POStartDate){
			this.POStartDate = dateFormat1.format(this.POStartDate);
			this.POStartDate = this.POStartDate.substring(0, 2) + " " + this.POStartDate.substring(2, 5) + " " + this.POStartDate.substring(5, 9);
			}
			this.MRNEndDate = this.getView().byId("mrnendDateId").getDateValue();
			this.MRNStartDate = this.getView().byId("mrnstartDateId").getDateValue();
			if(this.MRNEndDate){
				this.MRNEndDate = dateFormat1.format(this.MRNEndDate);
				this.MRNEndDate = this.MRNEndDate.substring(0, 2) + " " + this.MRNEndDate.substring(2, 5) + " " + this.MRNEndDate.substring(5, 9);
			}
			if(this.MRNStartDate){
			this.MRNStartDate = dateFormat1.format(this.MRNStartDate);
			this.MRNStartDate = this.MRNStartDate.substring(0, 2) + " " + this.MRNStartDate.substring(2, 5) + " " + this.MRNStartDate.substring(5, 9);
			}
			if(!data.PONum){
				data.PONum = "";
			}
			if(!data.MRNNumber){
				data.MRNNumber = "";
			}
			if(!data.Plant){
				this.Plant = this.unitCode;
			}else if(data.Plant){
				this.Plant = data.Plant;
			}
			if(!data.POStartDate){
				this.POStartDate = "";
			}
			if(!data.POEndDate){
				this.POEndDate = "";
			}
			if(!data.MRNStartDate){
				this.MRNStartDate = "";
			}
			if(!data.MRNEndDate){
				this.MRNEndDate = "";
			}
			oModel.read("/GetPendingInvoiceList" ,{
				urlParameters: {
					UnitCode: this.Plant,
					PoNum: data.PONum,
					MrnNumber: data.MRNNumber,
					FromPOdate: this.POStartDate,
					ToPOdate: this.POEndDate,
					FromMrndate: this.MRNStartDate,
					ToMrndate: this.MRNEndDate,
					Status: data.InvStatus
				},
				success : function (oData) {
					sap.ui.core.BusyIndicator.hide();
					that.DataModel.setData(oData);
					that.DataModel.refresh();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					// var value = JSON.parse(oError.response.body);
					// MessageBox.error(value.error.message.value);
					//MessageBox.error(oError.message);
				}
		});
		},

		onItempress: function (oEvent) {
			var data = oEvent.getParameter("listItem").getBindingContext("DataModel").getProperty();
			//this.detailModel.setData(data);
			this.PoNum = data.PONumber.replace(/\//g, '-');
			this.MRNnumber = data.MRNNumber.replace(/\//g, '-');
			this.router.navTo("ASNReportDetail", {
				"UnitCode": data.PlantCode,
				"PoNum": this.PoNum,
				"MRNnumber": this.MRNnumber,
				"AddressCode": data.VendorCode
			});
		},
		/////////////////////////////////////////Table Personalization////////////////////////////////
		onColumnSelection: function (event) {
			var that = this;
			var List = that.byId("List");
			var popOver = this.byId("popOver");
			if (List !== undefined) {
				List.destroy();
			}
			if (popOver !== undefined) {
				popOver.destroy();
			}
			/*----- PopOver on Clicking ------ */
			var popover = new sap.m.Popover(this.createId("popOver"), {
				showHeader: true,
				// showFooter: true,
				placement: sap.m.PlacementType.Bottom,
				content: []
			}).addStyleClass("sapMOTAPopover sapTntToolHeaderPopover sapUiResponsivePadding--header sapUiResponsivePadding--footer");

			/*----- Adding List to the PopOver -----*/
			var oList = new sap.m.List(this.createId("List"), {});
			this.byId("popOver").addContent(oList);
			var openAssetTable = this.getView().byId("TableDataId"),
				columnHeader = openAssetTable.getColumns();
			var openAssetColumns = [];
			for (var i = 0; i < columnHeader.length; i++) {
				var hText = columnHeader[i].getAggregation("header").getProperty("text");
				var columnObject = {};
				columnObject.column = hText;
				openAssetColumns.push(columnObject);
			}
			var oModel1 = new sap.ui.model.json.JSONModel({
				list: openAssetColumns
			});
			var itemTemplate = new sap.m.StandardListItem({
				title: "{oList>column}"
			});
			oList.setMode("MultiSelect");
			oList.setModel(oModel1);
			sap.ui.getCore().setModel(oModel1, "oList");
			var oBindingInfo = {
				path: 'oList>/list',
				template: itemTemplate
			};
			oList.bindItems(oBindingInfo);
			var footer = new sap.m.Bar({
				contentLeft: [],
				contentMiddle: [new sap.m.Button({
					text: "Cancel",
					press: function () {
						that.onCancel();
					}
				})],
				contentRight: [new sap.m.Button({
					text: "Save",
					press: function () {
						that.onSave();
					}
				})
				]

			});

			this.byId("popOver").setFooter(footer);
			var oList1 = this.byId("List");
			var table = this.byId("TableDataId").getColumns();
			/*=== Update finished after list binded for selected visible columns ==*/
			oList1.attachEventOnce("updateFinished", function () {
				var a = [];
				for (var j = 0; j < table.length; j++) {
					var list = oList1.oModels.undefined.oData.list[j].column;
					a.push(list);
					var Text = table[j].getHeader().getProperty("text");
					var v = table[j].getProperty("visible");
					if (v === true) {
						if (a.indexOf(Text) > -1) {
							var firstItem = oList1.getItems()[j];
							oList1.setSelectedItem(firstItem, true);
						}
					}
				}
			});
			popover.openBy(event.getSource());
		},
		/*================ Closing the PopOver =================*/
		onCancel: function () {
			this.byId("popOver").close();
		},
		/*============== Saving User Preferences ==================*/
		onSave: function () {
			var that = this;
			var oList = this.byId("List");
			var array = [];
			var items = oList.getSelectedItems();

			// Getting the Selected Columns header Text.
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var context = item.getBindingContext("oList");
				var obj = context.getProperty(null, context);
				var column = obj.column;
				array.push(column);
			}
			/*---- Displaying Columns Based on the selection of List ----*/
			var table = this.byId("TableDataId").getColumns();
			for (var j = 0; j < table.length; j++) {
				var Text = table[j].getHeader().getProperty("text");
				var Column = table[j].getId();
				var columnId = this.getView().byId(Column);
				if (array.indexOf(Text) > -1) {
					columnId.setVisible(true);
				} else {
					columnId.setVisible(false);
				}
			}

			this.byId("popOver").close();

		},
		/////////////////////////////////////////Table Personalization////////////////////////////////


		// Invoice Number f4 

		handleInvNumHelp: function () {

			if (!this.invNumFragment) {
				this.invNumFragment = sap.ui.xmlfragment("sap.fiori.invoicecreation.fragment.fragVendorInvNum", this);
				this.getView().addDependent(this.invNumFragment);
				this._invNumTemp = sap.ui.getCore().byId("vendorInvNumTempId").clone();
			}

			var StartDate = this.getView().byId("startDateId").getValue();
			var EndDate = this.getView().byId("endDateId").getValue();

			sap.ui.getCore().byId("vendorInvNumF4Id").bindAggregation("items", {
				path: "/SupplierInvoiceHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'",
				template: this._invNumTemp
			});

			this.invNumFragment.open();

		},
		vendorInvNumValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var StartDate = this.getView().byId("startDateId").getValue();
			var EndDate = this.getView().byId("endDateId").getValue();
			if (sValue) {
				sap.ui.getCore().byId("vendorInvNumF4Id").bindAggregation("items", {
					path: "/SupplierInvoiceHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'&search=" + sValue,
					template: this._invNumTemp
				});
			} else {
				sap.ui.getCore().byId("vendorInvNumF4Id").bindAggregation("items", {
					path: "/SupplierInvoiceHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'",
					template: this._invNumTemp
				});
			}
		},
		vendorInvNumValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			var VendorInvoice = oSelectedItem.getBindingContext().getProperty("VendorInvoice");
			this.localModel.getData().VendorInvoice = VendorInvoice;
			this.localModel.refresh(true);
			// this.getView().byId("vendorNumId").setValue(VendorInvoice);
		},

		handlePlantHelp: function () {
			var plantFragment = sap.ui.xmlfragment("sap.fiori.invoicecreation.fragment.fragPlant", this);
			this.getView().addDependent(plantFragment);
			this.oTemplate = sap.ui.getCore().byId("plantTempId").clone();
			sap.ui.getCore().byId("plantF4Id").bindAggregation("items", {
				path: "/PlantHelpSet",
				template: this.oTemplate
			});
			plantFragment.open();
		},

		handlePlantValueHelpClose: function (evt) {
			this.byId("PlantId").setValue(evt.getParameter("selectedItem").getTitle());
			evt.getSource().destroy();
		},

		handlePlantValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var path = evt.getSource().getBinding("items").getPath();
			var oPath = path.includes("?search") ? path.split("?search")[0] : path.split("&search")[0];
			var sPath = sValue === "" ? oPath : oPath.includes("?$filter") ? oPath + "&search=" + sValue : oPath + "?search=" + sValue;
			sap.ui.getCore().byId("plantF4Id").bindAggregation("items", sPath, this.oTemplate);
		},

		// Base Document Number F4

		handleBaseDocHelp: function () {

			if (!this.baseDocFrag) {
				this.baseDocFrag = sap.ui.xmlfragment("sap.fiori.invoicecreation.fragment.fragBaseDocNum", this);
				this.getView().addDependent(this.baseDocFrag);
				this._baseDocTemp = sap.ui.getCore().byId("baseDocNumTempId").clone();
			}

			var StartDate = this.getView().byId("startDateId").getValue();
			var EndDate = this.getView().byId("endDateId").getValue();
			sap.ui.getCore().byId("baseDocNumF4Id").bindAggregation("items", {
				path: "/BaseDocHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'",
				template: this._baseDocTemp
			});

			this.baseDocFrag.open();

		},
		baseDocNumValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var StartDate = this.getView().byId("startDateId").getValue();
			var EndDate = this.getView().byId("endDateId").getValue();
			if (sValue) {
				sap.ui.getCore().byId("baseDocNumF4Id").bindAggregation("items", {
					path: "/BaseDocHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'&search=" + sValue,
					template: this._baseDocTemp
				});
			} else {
				sap.ui.getCore().byId("baseDocNumF4Id").bindAggregation("items", {
					path: "/BaseDocHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'",
					template: this._baseDocTemp
				});
			}
		},
		baseDocNumValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			var BaseDocument = oSelectedItem.getBindingContext().getProperty("BaseDocument");
			this.localModel.getData().BaseDocument = BaseDocument;
			this.localModel.refresh(true);
			// this.getView().byId("baseDocId").setValue(BaseDocument);
		},

		/////////

		// ASN Number F4

		handleAsnNumHelp: function () {

			if (!this.AsnNumFrag) {
				this.AsnNumFrag = sap.ui.xmlfragment("sap.fiori.invoicecreation.fragment.fragAsnNum", this);
				this.getView().addDependent(this.AsnNumFrag);
				this._AsnNumTemp = sap.ui.getCore().byId("AsnNumTempId").clone();
			}

			var StartDate = this.getView().byId("startDateId").getValue();
			var EndDate = this.getView().byId("endDateId").getValue();

			sap.ui.getCore().byId("AsnNumF4Id").bindAggregation("items", {
				path: "/AsnHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'",
				template: this._AsnNumTemp
			});

			this.AsnNumFrag.open();

		},
		AsnValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var StartDate = this.getView().byId("startDateId").getValue();
			var EndDate = this.getView().byId("endDateId").getValue();
			if (sValue) {
				sap.ui.getCore().byId("AsnNumF4Id").bindAggregation("items", {
					path: "/AsnHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'&search=" + sValue,
					template: this._AsnNumTemp
				});
			} else {
				sap.ui.getCore().byId("AsnNumF4Id").bindAggregation("items", {
					path: "/AsnHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'",
					template: this._AsnNumTemp
				});
			}
		},
		AsnValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			var AsnNumber = oSelectedItem.getBindingContext().getProperty("AsnNumber");
			this.localModel.getData().AsnNumber = AsnNumber;
			this.localModel.refresh(true);
			// this.getView().byId("AsnNumId").setValue(AsnNumber);
		},
		// f4 material
		handleMaterialHelp: function () {

			if (!this.materialFrag) {
				this.materialFrag = sap.ui.xmlfragment("sap.fiori.invoicecreation.fragment.fragMaterial", this);
				this.getView().addDependent(this.materialFrag);
				this._materialTemp = sap.ui.getCore().byId("materialTempId").clone();
			}

			var StartDate = this.getView().byId("startDateId").getValue();
			var EndDate = this.getView().byId("endDateId").getValue();
			sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
				path: "/MaterialHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'",
				// path: "/MaterialHelpSet",
				template: this._materialTemp
			});

			this.materialFrag.open();

		},
		materialHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var StartDate = this.getView().byId("startDateId").getValue();
			var EndDate = this.getView().byId("endDateId").getValue();
			if (sValue) {
				sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
					path: "/MaterialHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'&search=" + sValue,
					// path: "/MaterialHelpSet?&search=" + sValue,
					template: this._materialTemp
				});
			} else {
				sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
					path: "/MaterialHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'",
					template: this._materialTemp
				});
			}
		},
		materialValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			var Material = oSelectedItem.getBindingContext().getProperty("Material");
			this.localModel.getData().Material = Material;
			this.localModel.refresh(true);
			// this.getView().byId("baseDocId").setValue(BaseDocument);
		},

		// f4 Vendor Code
		handleVendorCodeHelp: function () {

			if (!this.vendorFrag) {
				this.vendorFrag = sap.ui.xmlfragment("sap.fiori.invoicecreation.fragment.fragVendor", this);
				this.getView().addDependent(this.vendorFrag);
				this._vendorTemp = sap.ui.getCore().byId("vendorTempId").clone();
			}

			// var StartDate = this.getView().byId("startDateId").getValue();
			// var EndDate = this.getView().byId("endDateId").getValue();
			sap.ui.getCore().byId("vendorF4Id").bindAggregation("items", {
				// path: "/SupplierHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'",
				path: "/SupplierHelpSet",

				template: this._vendorTemp
			});

			this.vendorFrag.open();

		},
		vendorHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			// var StartDate = this.getView().byId("startDateId").getValue();
			// var EndDate = this.getView().byId("endDateId").getValue();
			if (sValue) {
				sap.ui.getCore().byId("vendorF4Id").bindAggregation("items", {
					// path: "/SupplierHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'&search=" + sValue,
					path: "/SupplierHelpSet?&search=" + sValue,

					template: this._vendorTemp
				});
			} else {
				sap.ui.getCore().byId("vendorF4Id").bindAggregation("items", {
					// path: "/SupplierHelpSet?$filter=StartDate eq '" + StartDate + "' and EndDate eq '" + EndDate + "'",
					path: "/SupplierHelpSet",

					template: this._vendorTemp
				});
			}
		},
		vendorValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			var Supplier = oSelectedItem.getBindingContext().getProperty("Supplier");
			this.localModel.getData().Supplier = Supplier;
			this.localModel.refresh(true);
			// this.getView().byId("baseDocId").setValue(BaseDocument);
		},

		onDataExport: function () {
			sap.ui.core.BusyIndicator.show();
			var aColumns = [{
				label: "Plant",
				property: "Plant"
			}, {
				label: "Plant Description",
				property: "PlantDesc"
			}, {
				label: "Invoice Number",
				property: "VendorInvoice"
			}, {
				label: "IBD",
				property: "Ibd"
			}, {
				label: "ASN Number",
				property: "AsnNumber"
			}, {
				label: "Shipment",
				property: "Shipment"
			}, {
				label: "ASN Created On",
				property: "CreatedOn",
				type: "date",
				inputFormat: "yyyymmdd",
				format: "dd-mm-yyyy"
			}, {
				label: "Shipment Date",
				property: "ShipmentDate",
				type: "date",
				inputFormat: "yyyymmdd",
				format: "dd-mm-yyyy"
			}, {
				label: "Order Number",
				property: "BaseDocument"
			}, {
				label: "Order Type",
				property: "BaseDocType"
			}, {
				label: "Purchase Group",
				property: "PurGrp"
			}, {
				label: "Material Code",
				property: "Material"
			}, {
				label: "Material Name",
				property: "Maktx"
			}, {
				label: "ASN Status",
				property: "AsnStatusText"
			}, {
				label: "Gr Status",
				property: "GrStatus"
			}, {
				label: "Inv. Status",
				property: "InvStatus"
			}, {
				label: "Invoice Value",
				property: "NetAmount",
				type: exportLibrary.EdmType.Number
			}, {
			}, {
				label: " Total Invoice Amount",
				property: "Totinvamt",
				type: exportLibrary.EdmType.Number
			}, {
				label: "IGST",
				property: "IgstAmount",
				type: exportLibrary.EdmType.Number
			}, {
				label: "CGST",
				property: "CgstAmount",
				type: exportLibrary.EdmType.Number
			}, {
				label: "SGST/UTGST",
				property: "SgstAmount",
				type: exportLibrary.EdmType.Number
			}, {
				label: "Currency",
				property: "Currency"
			}, {
				label: "Eway Bill No.",
				property: "Eway"
			}, {
				label: "Eway Bill Date",
				property: "EwayDate",
				type: "date",
				inputFormat: "yyyymmdd",
				format: "dd-mm-yyyy"
			}, {
				label: "Reached Plant Date",
				property: "RchPlantDt",
				type: "date",
				inputFormat: "yyyymmdd",
				format: "dd-mm-yyyy"
			}];
			if (this.loginModel.getData().LoginType === "E") {
				aColumns.splice(3, 0, {
					label: "Supplier",
					property: "Supplier"
				});
				aColumns.splice(4, 0, {
					label: "Supplier Name",
					property: "Name"
				});
			}
			var path = "/AsnDownloadSet?$filter=Flag eq 'X'";
			var data = this.localModel.getData();
			Object.keys(data).forEach(function (key) {
				if (data[key]) {
					path += " and " + key + " eq '" + data[key] + "'";
				}
			});
			var ASNFilterKey = "";
			// var GRNFilterKey = "";
			// var INVFilterKey = "";
			if (this.statusType === "Asn Status") {
				switch (this.byId("selectFilterId").getText().toLowerCase().trim()) {
					case "new":
						ASNFilterKey = "01";
						break;
					case "in transit":
						ASNFilterKey = "02";
						break;
					case "reached plant":
						ASNFilterKey = "03";
						break;
					case "unloading started":
						ASNFilterKey = "04";
						break;
					case "completed":
						ASNFilterKey = "05";
						break;
				}
				path = path + " and AsnStatus eq '" + ASNFilterKey + "'";
			}
			// if (this.StatusFilterValue.toUpperCase().trim() === "Yet To Ship".toUpperCase().trim()) {
			// 	ASNFilterKey = "01";
			// }
			// if (this.StatusFilterValue.toUpperCase().trim() === "In Transit".toUpperCase().trim()) {
			// 	ASNFilterKey = "02";
			// }
			// if (this.StatusFilterValue.toUpperCase().trim() === "Reached Plant".toUpperCase().trim()) {
			// 	ASNFilterKey = "03";
			// }
			// if (this.StatusFilterValue.toUpperCase().trim() === "Unloading Started".toUpperCase().trim()) {
			// 	ASNFilterKey = "04";
			// }
			// if (this.StatusFilterValue.toUpperCase().trim() === "Goods Received".toUpperCase().trim()) {
			// 	ASNFilterKey = "05";
			// }
			// if (this.StatusFilterValue.toUpperCase().trim() === "Completed".toUpperCase().trim()) {
			// 	ASNFilterKey = "06";
			// }
			// if (this.StatusFilterValue.toUpperCase().trim() === "Cancelled".toUpperCase().trim()) {
			// 	ASNFilterKey = "06";
			// }
			// }
			if (this.statusType === "Gr Status") {
				path = path + " and GrStatus eq '" + this.byId("selectFilterId").getText() + "'";
			}
			if (this.statusType === "Inv. Status") {
				path = path + " and InvStatus eq '" + this.byId("selectFilterId").getText() + "'";
			}
			sap.ui.getCore().getModel("oDataModel").read(path, null, null, true,
				function (oData) {
					sap.ui.core.BusyIndicator.hide();
					if (oData.results.length > 0) {
						sap.fiori.invoicecreation.controller.formatter.RemoveNull(oData);
						var oSpreadsheet = new sap.ui.export.Spreadsheet({
							workbook: {
								columns: aColumns
							},
							dataSource: oData.results,
							fileName: "AsnReport.xlsx"
						});
						oSpreadsheet.build();
					} else {
						sap.m.MessageToast.show("No Data");
					}
				},
				function (oError) {
					var value = JSON.parse(oError.response.body);
					sap.m.MessageBox.error(value.error.message.value);
					sap.ui.core.BusyIndicator.hide();
				});
		},

		onAsnPress: function (oEvent) {
			var Asn = oEvent.getSource().getTitle().split("/");
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Shipment",
					action: "ASN"
				},
				params: {
					"Asn_Num": Asn[0],
					"FisYear": Asn[1]
				}
			})) || ""; // generate the Hash to display Attachment
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			}); // navigate to ASN application
		},
		onupdateFinished: function (evt) {
			// to highlight live search 
			var sValue = this.byId("search").getValue(),
				index;
			$("[data-highlight='true']").each(function () {
				$(this).removeClass("highlight");
				if (sValue) {
					index = $(this).text().toLowerCase().indexOf(sValue.toLowerCase());
					if (index !== -1) {
						$(this).addClass("highlight");
					}
				}
			});
			// if (this.StatusFlag !== true) {
			// 	// var that = this;
			// 	var data = [{
			// 		"Text": "",
			// 		"Key": ""
			// 	}];
			// 	var unique = [];
			// 	evt.getSource().getItems().forEach(item => {
			// 		var obj = item.getBindingContext("DataModel").getObject();
			// 		if (unique.includes(obj.AsnStatusText) === false) {
			// 			unique.push(obj.AsnStatusText);
			// 			data.push({
			// 				"Text": obj.AsnStatusText,
			// 				"Key": obj.AsnStatusText
			// 			});
			// 		}
			// 	});
			// 	this.StatusModel.setData(data);
			// 	this.StatusModel.refresh(true);
			// 	this.byId("selectFilterId").setModel(this.getView().getModel("StatusModel"));
			// 	this.StatusFlag = true;
			// } else {
			// 	return;
			// }
		},

		onMenuAction: function (event) {
			// this.onFilterGoPress();
			// var oBindingInfo = this.byId("TableDataId").getBinding("items");
			var sValue = event.getParameter("item").getProperty("text");
			// this.StatusFilterValue = sValue;
			this.byId("selectFilterId").setText(sValue);
			// that.StatusFilterId = "";
			// this.StatusFilterValue = SearchValue;
			// var ID = event.getParameter("item").getId();
			// if (!SearchValue) {
			// 	SearchValue = "";
			// 	that.StatusFilterId = "";
			// }
			this.statusType = event.getParameter("item").getParent().getText();
			this.statusFilters = [];
			if (sValue) {
				switch (this.statusType) {
					case "Asn Status":
						this.statusFilters.push(new sap.ui.model.Filter("AsnStatusText", sap.ui.model.FilterOperator.EQ, sValue));
						break;
					case "Gr Status":
						this.statusFilters.push(new sap.ui.model.Filter("GrStatus", sap.ui.model.FilterOperator.EQ, sValue));
						break;
					case "Inv. Status":
						this.statusFilters.push(new sap.ui.model.Filter("InvStatus", sap.ui.model.FilterOperator.EQ, sValue));
						break;
				}
				// 	if (ID.includes("AsnStatusId")) {
				// 		that.StatusFilterId = "AsnId";
				// 		var afilters = [
				// 			new sap.ui.model.Filter({
				// 				filters: [
				// 					new sap.ui.model.Filter({
				// 						path: 'AsnStatusText',
				// 						operator: sap.ui.model.FilterOperator.EQ,
				// 						value1: SearchValue
				// 					})
				// 				],
				// 				and: false
				// 			})
				// 		];
				// 	}
				// 	if (ID.includes("GrCompId") || ID.includes("GrPendingId")) {
				// 		that.StatusFilterId = "GrId";
				// 		var afilters = [
				// 			new sap.ui.model.Filter({
				// 				filters: [
				// 					new sap.ui.model.Filter({
				// 						path: 'GrStatus',
				// 						operator: sap.ui.model.FilterOperator.EQ,
				// 						value1: SearchValue
				// 					})
				// 				],
				// 				and: false
				// 			})
				// 		];
				// 	}
				// 	if (ID.includes("InvCompId") || ID.includes("InvPendingId")) {
				// 		that.StatusFilterId = "InvId";
				// 		var afilters = [
				// 			new sap.ui.model.Filter({
				// 				filters: [
				// 					new sap.ui.model.Filter({
				// 						path: 'InvStatus',
				// 						operator: sap.ui.model.FilterOperator.EQ,
				// 						value1: SearchValue
				// 					})
				// 				],
				// 				and: false
				// 			})
				// 		];
				// 	}
				// } else {
				// 	delete oBindingInfo.filters;
			}
			this.byId("TableDataId").getBinding("items").filter(new sap.ui.model.Filter({
				filters: [...this.statusFilters, ...this.searhFilters]
			}));
		},

		onSearch: function (evt) {
			var search = evt.getParameter("newValue") || evt.getParameter("query");
			this.searhFilters = [];
			if (search) {
				this.searhFilters.push(new sap.ui.model.Filter("PurGrp", sap.ui.model.FilterOperator.Contains, search));
				this.searhFilters.push(new sap.ui.model.Filter("Ibd", sap.ui.model.FilterOperator.Contains, search));
				this.searhFilters.push(new sap.ui.model.Filter("Shipment", sap.ui.model.FilterOperator.Contains, search));
				this.searhFilters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.Contains, search));
				this.searhFilters.push(new sap.ui.model.Filter("PlantDesc", sap.ui.model.FilterOperator.Contains, search));
			}
			this.byId("TableDataId").getBinding("items").filter(new sap.ui.model.Filter({
				filters: [...this.searhFilters, ...this.statusFilters]
			}));
		},

		onFromDateChange: function (oEvent) {
			var FromDate = this.getView().byId("postartDateId").getDateValue();
			var ToDate = this.getView().byId("poendDateId").getDateValue();
			this.getView().byId("poendDateId").setMinDate(FromDate);
			if (ToDate <= FromDate) {
				this.getView().byId("poendDateId").setDateValue(new Date(FromDate));
			}
			oEvent.getSource().$().find('INPUT').attr('disabled', true).css('color', '#000000');
		}
	});

});