sap.ui.define([
	"ch/neo/fiori/mm/grchange/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("ch.neo.fiori.mm.grchange.controller.App", {

		onInit: function() {

			// Local model
			var oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			oViewModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this.setModel(oViewModel, "appView");

		}
	});

});