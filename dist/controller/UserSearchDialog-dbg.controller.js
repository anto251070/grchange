sap.ui.define([
 	//"ch/neo/fiori/mm/grchange/controller/BaseController",
	 "sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"ch/neo/fiori/mm/grchange/model/formatter"
], function (BaseController, MessageBox, History, formatter) {
	"use strict";

	return BaseController.extend("ch.neo.fiori.mm.grchange.controller.UserSearchDialog", {

		formatter: formatter,

		setRouter: function (oRouter) {
			this.oRouter = oRouter;
		},

		getBindingParameters: function () {
			return {};
		},

		_onSearchFieldLiveChange: function (oEvent) {
			var sControlId = "ch.neo.fiori.mm.grchange.userSearchResultList";

			var oControl = this.getView().byId(sControlId);

			// Get the search query, regardless of the triggered event ('query' for the search event, 'newValue' for the liveChange one).
			var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
			var sSourceId = oEvent.getSource().getId();

			return new Promise(function () {
				var aFinalFilters = [];

				var aFilters = [];

				// 1) Search filters (with OR)
				if (sQuery && sQuery.length > 0) {
				  	aFilters.push(new sap.ui.model.Filter("Username", sap.ui.model.FilterOperator.Contains, sQuery));
				 	aFilters.push(new sap.ui.model.Filter("Firstname", sap.ui.model.FilterOperator.Contains, sQuery));
				    aFilters.push(new sap.ui.model.Filter("Lastname", sap.ui.model.FilterOperator.Contains, sQuery));
				}
				aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : [];
				var oBindingOptions = this.updateBindingOptions(sControlId, {
					filters: aFinalFilters
				}, sSourceId);
				var oBindingInfo = oControl.getBindingInfo("items");
				oControl.bindAggregation("items", {
					model: oBindingInfo.model,
					path: oBindingInfo.path,
					parameters: oBindingInfo.parameters,
					template: oBindingInfo.template,
					sorter: oBindingOptions.sorters,
					filters: oBindingOptions.filters
				});
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		updateBindingOptions: function (sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = oBindingData.sorters === undefined ? this.mBindingOptions[sCollectionId].sorters : oBindingData.sorters;
			var oGroupby = oBindingData.groupby === undefined ? this.mBindingOptions[sCollectionId].groupby : oBindingData.groupby;

			// 1) Update the filters map for the given collection and source
			this.mBindingOptions[sCollectionId].sorters = aSorters;
			this.mBindingOptions[sCollectionId].groupby = oGroupby;
			this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
			this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (oGroupby) {
				aSorters = aSorters ? [oGroupby].concat(aSorters) : [oGroupby];
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};
		},

		onOkButtonPress: function () {
			// Get selected vendor
			var sControlId = "ch.neo.fiori.mm.grchange.userSearchResultList";
			var oControl = this.getView().byId(sControlId);
			// var aSelected = oControl._aSelectedPaths[0].substr(6);
			// var aSelectedvend = aSelected.split("'");
			  
			 
			var oRequestor = oControl.getSelectedItem().getBindingContext().getObject(); 
			
			// // Set description in presentation field
			// this.getView().byId("createdby").setValue(oRequestor.Username); 
			
			// Filter purchase order master list
			sap.ui.getCore().getEventBus().publish(
				"EventChannel",
				"UserSelected",
				oRequestor.Username
			);

			// Close view
			var oDialog = this.getView().getContent()[0];

			return new Promise(function (fnResolve) {
				oDialog.attachEventOnce("afterClose", null, fnResolve);
				oDialog.close();
			});
		},

		onCancelButtonPress: function () {
			var oDialog = this.getView().getContent()[0];

			return new Promise(function (fnResolve) {
				oDialog.attachEventOnce("afterClose", null, fnResolve);
				oDialog.close();
			});
		},

		onInit: function () {
			this.mBindingOptions = {};
			this._oDialog = this.getView().getContent()[0];

			// Before show
			this.getView().addEventDelegate({
				onBeforeShow: function () {
					this._onBeforeShow();
				}.bind(this)
			});

			var sControlId = "ch.neo.fiori.mm.grchange.userSearchResultList";
			var oControl = this.getView().byId(sControlId);
			// oControl.setModel(this.getOwnerComponent().getModel("PurchaseOrderModel"), "PurchaseOrderModel");

		},

		/**
		 * When the View is displayed (each time)
		 * @public
		 * */
		_onBeforeShow: function () {

		},

		onExit: function () {
			this._oDialog.destroy();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ch.neo.fiori.mm.gr.creategrcreate.view.GRCreate
		 */
		onBeforeRendering: function () {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ch.neo.fiori.mm.gr.creategrcreate.view.GRCreate
		 */
		onAfterRendering: function () {

		}
	});
}, 
/* bExport= */ true);