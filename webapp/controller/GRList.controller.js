sap.ui.define([
	"ch/neo/fiori/mm/grchange/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"ch/neo/fiori/mm/grchange/libs/Commons",
	"sap/ui/core/mvc/Controller"
], function (BaseController, JSONModel, Commons, Controller) {
	"use strict";

	return BaseController.extend("ch.neo.fiori.mm.grchange.controller.GRList", {
		_oView: null,
		_oEvent: null,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ch.neo.fiori.mm.grchange.view.GRDelete
		 */
		onInit: function () {

			this._oView = this.getView();
			this._subscribeEvents();
			this._oView.setModel(this.getOwnerComponent().getModel("PurchaseOrderModel"), "PurchaseOrderModel");

			/*	Read entity set Parameters */
			// create JSON model
			var oODataJSONModelParam = new sap.ui.model.json.JSONModel();
			var ParametersodataModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZMM_GOODS_RECEIPT_SRV/", true);
			ParametersodataModel.read("/Parameters",
				null,
				null,
				false,
				function (oData, oResponse) {
					//  set the odata JSON as data of JSON model
					oODataJSONModelParam.setData(oData);
				}
			);

			var oParam = JSON.parse(JSON.stringify(oODataJSONModelParam.getData()));
			this._aPgracquito = oParam.results[0].EKG;
			this._oView.byId("purchasingGroup").setValue(this._aPgracquito);
			// SCDL-26
			this._aUname = oParam.results[0].UNAME;
			this._oView.byId("createdby").setValue(this._aUname);

			//get Local Model GR JSON
			sap.ui.getCore().setModel(this.getOwnerComponent().getModel("GoodsReceiptDelete"), "GoodsReceiptDelete");
			var oGoodsReceiptDelete = sap.ui.getCore().getModel("GoodsReceiptDelete");
			this.getView().setModel(oGoodsReceiptDelete, "GoodsReceiptDelete");
			this._oGoodsReceiptDelete = oGoodsReceiptDelete;

			this.getView().addEventDelegate({

				onBeforeShow: function () {
					this._setInitialFilter();
					this._clearGoodsReceiptDelete();
				}.bind(this)
			});

		},

		/**
		 * Launch the Purchase Orders search according to current filters
		 * @param {object} oEvent The event
		 * @public
		 * */
		onSearch: function (oEvent) {
			this.getView().byId("goodsreceiptlist").getBinding("items").filter(this._getFilters());
		},

		/**
		 * Read filter value from the View and create the sap.ui.model.Filter
		 * (only create a Filter for non empty values)
		 * @returns {Object} Filters
		 * @private
		 * */
		_getFilters: function () {
			var aFilters = [];

			// basic String, do a Contains search
			var sPurchase = this._oView.byId("purchase").getValue();
			if (sPurchase !== "") {
				var filterPurchase = new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.Contains, sPurchase.toUpperCase());
				aFilters.push(filterPurchase);
			}

			// Vendor is an Id, so use an EQ operator
			var sVendor = this._oView.byId("vendor").getValue();
			if (sVendor !== "") {
				var filterVendor = new sap.ui.model.Filter("VendorId", sap.ui.model.FilterOperator.EQ, sVendor);
				aFilters.push(filterVendor);
			}

			// Purchasing Group is an Id, so use an EQ operator
			var sPurchasingGroup = this._oView.byId("purchasingGroup").getValue();
			if (sPurchasingGroup !== "") {
				var filterPurchasingGroup = new sap.ui.model.Filter("PurchasingGroupId", sap.ui.model.FilterOperator.EQ, sPurchasingGroup.toUpperCase());
				aFilters.push(filterPurchasingGroup);
			}

			var sCreatedby = this._oView.byId("createdby").getValue();

			// to uppercase
			var upsCreatedby = sCreatedby.toUpperCase();
			sCreatedby = upsCreatedby;

			if (sCreatedby !== "") {

				var filterCreatedby = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, sCreatedby);
				aFilters.push(filterCreatedby);
			}

			return new sap.ui.model.Filter(aFilters, true);
		},

		/**
		 * The purchase orders list is to be pre-filtered for its first display
		 * @private
		 * */
		_setInitialFilter: function () {
			var aFilters = [];
			var aFinalFilters = [];

			var oFilterBarGA = this.getView().byId("purchasingGroup");

			// oFilterBarGA.getFilterItems(); //

			aFilters.push(new sap.ui.model.Filter("PurchasingGroupId", sap.ui.model.FilterOperator.EQ, this._aPgracquito));
			aFinalFilters = [new sap.ui.model.Filter(aFilters, true)];

			aFilters = [];
			aFilters.push(new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, this._aUname));
			aFinalFilters = [new sap.ui.model.Filter(aFilters, true)];

			this.getView().byId("goodsreceiptlist").getBinding("items").filter(aFinalFilters);
		},

		/**
		 * Subscribe some events that should be fired by others Controllers
		 * @private
		 * */
		_subscribeEvents: function () {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe(
				"EventChannel",
				"VendorSelected",
				this.onVendorSelected,
				this
			);

			oEventBus.subscribe(
				"EventChannel",
				"PurchasingGroupSelected",
				this.onPurchasingGroupSelected,
				this
			);

			oEventBus.subscribe(
				"EventChannel",
				"GoodsReceiptReload",
				this.reload,
				this
			);

			oEventBus.subscribe(
				"EventChannel",
				"UserSelected",
				this.onUserSelected,
				this
			);

		},

		/**
		 * Launch Vendor Search Help dialog
		 * @param {object} oEvent The event
		 * @public
		 * */
		onValueHelpRequestVendor: function (oEvent) {
			Commons.openVendorSearchDialog(oEvent, this);
		},

		/**
		 * Launch Purchasing Group Search Help dialog
		 * @param {object} oEvent The event
		 * @public
		 * */
		onValueHelpRequestPurchasingGroup: function (oEvent) {
			Commons.openPurchasingGroupSearchDialog(oEvent, this);
		},

		/**
		 * Launch Users Search Help dialog
		 * @param {object} oEvent The event
		 * @public
		 * */
		onValueHelpRequestUsers: function (oEvent) {
			Commons.openUsersSearchDialog(oEvent, this);
		},

		/**
		 * Triggered once a Vendor has been selected from the Search Help Dialog
		 * Fetch the selected Vendor from dialog and set it into the View
		 * @param {string} sChannelId Channel for the Event workflow
		 * @param {string} sEventId Event Id
		 * @param {object} oSelectedVendor Object containing the selected Vendor
		 * @public
		 * */
		onVendorSelected: function (sChannelId, sEventId, oSelectedVendor) {
			//	this._oView.byId("vendor").setValue(oSelectedVendor.Id);
			this._oView.byId("vendor").setValue(oSelectedVendor);
		},

		/**
		 * Triggered once a Purchasing Group has been selected from the Search Help Dialog
		 * Fetch the selected Purchasing Group from dialog and set it into the View
		 * @param {string} sChannelId Channel for the Event workflow
		 * @param {string} sEventId Event Id
		 * @param {object} oSelectedGroup Object containing the selected Purchasing Group
		 * @public
		 * */
		onPurchasingGroupSelected: function (sChannelId, sEventId, oSelectedGroup) {
			// this._oView.byId("purchasingGroup").setValue(oSelectedGroup.Id);
			this._oView.byId("purchasingGroup").setValue(oSelectedGroup);

		},

		/**
		 * Triggered once a User has been selected from the Search Help Dialog
		 * Fetch the selected Purchasing Group from dialog and set it into the View
		 * @param {string} sChannelId Channel for the Event workflow
		 * @param {string} sEventId Event Id
		 * @param {object} oSelectedGroup Object containing the selected Purchasing Group
		 * @public
		 * */
		onUserSelected: function (sChannelId, sEventId, oSelectedUser) {

			// Set description in presentation field

			if (oSelectedUser.length > 0) {

				this._oView.byId("createdby").setValue(oSelectedUser);

			} else {
				this._oView.byId("createdby").setValue("");
			}
		},

		/**
		 * Action click of link on List item
		 */
		onNavToPurchaseOrder: function (oEvent) {

			var Param = oEvent.getParameters();
			var oSource = oEvent.getSource();
			var POid = oSource.getText();
			// https://answers.sap.com/questions/12060816/opening-an-app-in-new-tab-using-cross-app-navigati.html
			// Step 1: Get Service for app to app navigation

			var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');

			// Step 2: Navigate using your semantic object

			var hash = navigationService.hrefForExternal({

				target: {
					semanticObject: "ZPurchaseOrder",
					action: "update"
				},

				params: {
					PurchaseOrderHeaderId: POid
				}

			});

			var url = window.location.href.split('#')[0] + hash;

			sap.m.URLHelper.redirect(url, true);

		},

		/**
		 * Triggered when the User clicks on a GR within the list (Table)
		 * Should navigate to the next screen with the GR Id
		 * @param {object} oEvent The event
		 * @public
		 * */
		onItemPress: function (oEvent) {

			//get property line selected for screen 02
			var sVendorName = oEvent.getParameter("listItem").getBindingContext().getProperty("VendorName");
			var sDescription = oEvent.getParameter("listItem").getBindingContext().getProperty("Description");
			var sGRId = oEvent.getParameter("listItem").getBindingContext().getProperty("Id");
			var sGRMaterialDocumentYear = oEvent.getParameter("listItem").getBindingContext().getProperty("MaterialDocumentYear");
			var sPOId = oEvent.getParameter("listItem").getBindingContext().getProperty("PurchaseOrderHeaderId");
			var sPostingDate = oEvent.getParameter("listItem").getBindingContext().getProperty("PostingDate");
			var sCreationDate = oEvent.getParameter("listItem").getBindingContext().getProperty("CreationDate");
			var sBillOfLadingDocumentNumber = oEvent.getParameter("listItem").getBindingContext().getProperty("BillOfLadingDocumentNumber");
			var sCreator = oEvent.getParameter("listItem").getBindingContext().getProperty("CreatedBy");

			sap.ui.getCore().setModel(this.getOwnerComponent().getModel("GoodsReceiptDeleteItems"), "GoodsReceiptDeleteItems");

			//set property line selected for screen 02	
			this._oGoodsReceiptDelete.setProperty("/Id", sGRId);
			this._oGoodsReceiptDelete.setProperty("/MaterialDocumentYear", sGRMaterialDocumentYear);
			this._oGoodsReceiptDelete.setProperty("/PurchaseOrderHeaderId", sPOId);
			this._oGoodsReceiptDelete.setProperty("/Description", sDescription);
			this._oGoodsReceiptDelete.setProperty("/VendorName", sVendorName);
			this._oGoodsReceiptDelete.setProperty("/PostingDate", sPostingDate);
			this._oGoodsReceiptDelete.setProperty("/CreationDate", sCreationDate);
			this._oGoodsReceiptDelete.setProperty("/BillOfLadingDocumentNumber", sBillOfLadingDocumentNumber);
			this._oGoodsReceiptDelete.setProperty("/Description", sDescription);
			this._oGoodsReceiptDelete.setProperty("/Creator", sCreator);
			this._oGoodsReceiptDelete.setProperty("/Action", "UPDATE");

			var GoodsReceiptDeleteItems = this._oGoodsReceiptDelete.getProperty("/GoodsReceiptItems");

			if (GoodsReceiptDeleteItems.length > 0) {
				GoodsReceiptDeleteItems = [];
			}

			//read ODATA GR Items for  Id selected

			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZMM_GOODS_RECEIPT_SRV/", true);

			oModel.read("GoodsReceiptHeaders(Id='" + sGRId + "',MaterialDocumentYear='" + sGRMaterialDocumentYear + "')/GoodsReceiptItems", {
				async: false,
				success: function (oGRItems) {
					// Update new purchase order lines

					for (var i = 0; i < oGRItems.results.length; i++) {

						// Copy purchase order item
						var oGoodsReceiptDeleteItem = JSON.parse(JSON.stringify(sap.ui.getCore().getModel("GoodsReceiptDeleteItems").getData()));

						oGoodsReceiptDeleteItem.MaterialDocumentItem = oGRItems.results[i].MaterialDocumentItem;
						oGoodsReceiptDeleteItem.Material = oGRItems.results[i].Material;
						oGoodsReceiptDeleteItem.Description = oGRItems.results[i].Description;
						oGoodsReceiptDeleteItem.Ordered = oGRItems.results[i].Ordered;
						oGoodsReceiptDeleteItem.Delivered = oGRItems.results[i].Delivered;
						oGoodsReceiptDeleteItem.Quantity = oGRItems.results[i].Quantity;
						oGoodsReceiptDeleteItem.UnitMeasure = oGRItems.results[i].UnitMeasure;
						oGoodsReceiptDeleteItem.POItem = oGRItems.results[i].POItem;
						oGoodsReceiptDeleteItem.OK = false;

						// add new line
						GoodsReceiptDeleteItems.push(oGoodsReceiptDeleteItem);

					}

					oModel.refresh(true);

				},
				error: function () {

				}

			});

			//read ODATA GR Attachements  for  Id selected
			sap.ui.getCore().setModel(this.getOwnerComponent().getModel("Files"), "Files");

			// arry file empy if it has been filled before 
			this._oGoodsReceiptDelete.setProperty("/Files", []);
			var GoodsReceiptFiles = this._oGoodsReceiptDelete.getProperty("/Files");

			oModel.read("GoodsReceiptHeaders(Id='" + sGRId + "',MaterialDocumentYear='" + sGRMaterialDocumentYear + "')/Files", {
				async: false,
				success: function (oFiles) {

					for (var i = 0; i < oFiles.results.length; i++) {
						var Files_json = JSON.parse(JSON.stringify(sap.ui.getCore().getModel("Files").getData()));
						Files_json.AttachmentId = oFiles.results[i].AttachmentId;
						Files_json.GoodsReceiptId = oFiles.results[i].GoodsReceiptId;
						Files_json.MaterialDocumentYear = oFiles.results[i].MaterialDocumentYear;
						Files_json.FileName = oFiles.results[i].FileName;
						Files_json.MimeType = oFiles.results[i].MimeType;
						Files_json.URL = oFiles.results[i].Url;
						Files_json.Description = oFiles.results[i].Description;
						Files_json.CreatedOn = oFiles.results[i].CreatedOn;
						Files_json.CreatedBy = oFiles.results[i].CreatedBy;
						Files_json.FileContent = oFiles.results[i].FileContent;
						Files_json.ArchiveTypeId = oFiles.results[i].ArchiveTypeId;

						// add new line
						GoodsReceiptFiles.push(Files_json);

					}

					oModel.refresh(true);

				},
				error: function () {

				}

			});

			this._navToGRChange(sGRId);

		},

		/**
		 * Fire navigation !
		 *  @param {sGRId}
		 *  @param {sGRMaterialDocumentYear}
		 */
		_navToGRChange: function (sGRId) {
			if (sGRId) {

				sap.ui.core.UIComponent.getRouterFor(this).navTo("grdelete");

			}
		},

		/**
		 * Clear JSON GoodsReceiptDelete
		 * @private
		 * */
		_clearGoodsReceiptDelete: function () {
			if (this._oGoodsReceiptDelete) {
				this._oGoodsReceiptDelete.setProperty("/GoodsReceiptItems", []);
				this._oGoodsReceiptDelete.setProperty("/Files", []);
				this._oGoodsReceiptDelete.setProperty("/PurchaseOrderHeaderId", null);
				this._oGoodsReceiptDelete.setProperty("/PostingDate", null);
				this._oGoodsReceiptDelete.setProperty("/CreationDate", null);
				this._oGoodsReceiptDelete.setProperty("/VendorName", null);
				this._oGoodsReceiptDelete.setProperty("/Description", null);
				this._oGoodsReceiptDelete.setProperty("/Id", null);
				this._oGoodsReceiptDelete.setProperty("/BillOfLadingDocumentNumber", null);
				this._oGoodsReceiptDelete.setProperty("/MaterialDocumentYear", null);
				this._oGoodsReceiptDelete.setProperty("/Creator", null);
				this._oGoodsReceiptDelete.setProperty("/Action", null);
			}
		},

		/**
		 * Reload application data (e.g. when we're coming from the Pricing view)
		 * @param {String} sChannelId Channel Id
		 * @param {String} sEventId The Event Id
		 * @param {String} sData The Data
		 * @public
		 * */
		reload: function (sChannelId, sEventId, sData) {
			// Clear the purchase order
			this._clearGoodsReceiptDelete();

			//insert the GA from user SAP
			if (this._aPgracquito !== "") {
				this._oView.byId("purchasingGroup").setValue(this._aPgracquito);
			}

			// Refresh data
			var that = this;
			setTimeout(function () {
				that._refresh();
			}, 0);
		},

		/**
		 * Refresh items list
		 * @private
		 * */
		_refresh: function () {
			this.getView().byId("goodsreceiptlist").getBinding("items").refresh();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ch.neo.fiori.mm.grchange.view.GRDelete
		 */
		onBeforeRendering: function () {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ch.neo.fiori.mm.grchange.view.GRDelete
		 */
		onAfterRendering: function () {

		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ch.neo.fiori.mm.grchange.view.GRDelete
		 */
		onExit: function () {

		}

	});

});