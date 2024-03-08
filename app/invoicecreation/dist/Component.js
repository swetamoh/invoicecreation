sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","sap/fiori/invoicecreation/model/models","sap/m/MessageBox","sap/ui/model/json/JSONModel","sap/ui/model/odata/ODataModel","sap/ui/core/routing/HashChanger","sap/fiori/invoicecreation/controller/formatter"],function(e,a,t,i,o,r,s,n){"use strict";return e.extend("sap.fiori.invoicecreation.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);var a=window.location.href.includes("site")?"/":"";var s=jQuery.sap.getModulePath("sap.fiori.invoicecreation");s=s==="."?"":s;var n=s+a+this.getMetadata().getManifestEntry("sap.app").dataSources.mainService.uri;var d=new r(n,true);d.attachMetadataFailed(e=>{var a=e.getParameter("response").body;if(a.indexOf("<?xml")!==-1){i.error($($.parseXML(a)).find("message").text())}else{i.error(a)}});d.attachMetadataLoaded(()=>{this.setModel(d);sap.ui.getCore().setModel(d,"oModel");d.setDefaultCountMode("None");sap.ui.getCore().setModel(new o,"navToItem");this.setModel(t.createDeviceModel(),"device");var e=window.location.href.includes("site");if(e){$.ajax({url:s+a+"user-api/attributes",type:"GET",success:e=>{}})}});d.attachRequestFailed(e=>{var a=e.getParameter("responseText");if(a.indexOf("<?xml")!==-1){i.error($($.parseXML(a)).find("message").text())}else{i.error(JSON.parse(a).error.message.value)}});this.getRouter().initialize()}})});