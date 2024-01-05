sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("sap.fiori.invoicecreation.controller.ASNReportDetail", {

		onInit: function() {
			//this._tableTemp = this.getView().byId("tableTempId").clone();
			this.detailModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.detailModel, "detailModel");
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRouteMatched(this.handleRouteMatched, this);
		},
		
		handleRouteMatched: function(oEvent) {
			if (oEvent.getParameter("name") === "ASNReportDetail") {
				var that = this;
				//this.detailModel.refresh(true);
                var oModel = this.getOwnerComponent().getModel();
				var data = oEvent.getParameter("arguments");
                this.UnitCode = data.UnitCode;
                this.PoNum = data.PoNum.replace(/-/g, '/');
				this.MRNnumber = data.MRNnumber.replace(/-/g, '/');
                this.AddressCode = data.AddressCode;
				//this.getView().byId("pageId").setTitle("ASN Number - " + this.AsnNumber);
                var request = "/GetPoDetailstoCreateInvoice";
				oModel.read(request, {
                    urlParameters: {
						"$expand": "DocumentRows",
                        UnitCode: this.UnitCode,
                        PoNum:  this.PoNum,
                        MRNnumber: this.MRNnumber,
                        AddressCode: this.AddressCode
                    },
					success: function (oData) {
						var filteredPurchaseOrder = oData.results.find(po => po.PONumber === that.PoNum);
						if (filteredPurchaseOrder) {
							that.detailModel.setData(filteredPurchaseOrder);
							that.detailModel.refresh(true);
						} else {
							MessageBox.error("Data not found");
						}
					},
					error: function (oError) {
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value);
					}
				});

			}
		},
		onNavPress: function() {
			history.go(-1);
		},
		// onFilterClear: function() {
		// 	var oView = this.getView();
		// 	oView.byId("MaterialId").setSelectedKey("");
		// },
		// handleMaterialHelp: function() {

		// 	if (!this.materialFragment) {
		// 		this.materialFragment = sap.ui.xmlfragment("sap.fiori.invoicecreation.fragment.fragMaterial", this);
		// 		this.getView().addDependent(this.materialFragment);
		// 		this._materialTemp = sap.ui.getCore().byId("materialTempId").clone();
		// 	}

		// 	sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
		// 		path: "/MaterialHelpSet?$filter=Ebeln eq '" + this.data1.Ebeln + "'",
		// 		template: this._materialTemp
		// 	});

		// 	this.materialFragment.open();

		// },
		// handleMaterialValueHelpSearch: function(evt) {
		// 	var sValue = evt.getParameter("value");
		// 	if (sValue) {
		// 		sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
		// 			path: "/MaterialHelpSet?$filter=Matnr eq '" + sValue + "' and Ebeln eq '" + this.data1.Ebeln + "'",
		// 			template: this._materialTemp
		// 		});
		// 	} else {
		// 		sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
		// 			path: "/MaterialHelpSet?$filter=Ebeln eq='" + this.data1.Ebeln + "' ",
		// 			template: this._materialTemp
		// 		});
		// 	}
		// },
		// handleMaterialValueHelpClose: function(evt) {
		// 	var oSelectedItem = evt.getParameter("selectedItem");
		// 	var Matnr = oSelectedItem.getBindingContext().getProperty("Matnr");
		// 	this.getView().byId("MaterialId").setValue(Matnr);
		// }
	});

});