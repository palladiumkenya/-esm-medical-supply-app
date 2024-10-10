import {
  getAsyncLifecycle,
  defineConfigSchema,
  getSyncLifecycle,
  translateFrom,
} from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";

//import { createLeftPanelLink } from "./left-panel-link";
//import RadiologyOrderBasketPanelExtension from "./form/radiology-orders/radiology-order-basket-panel/radiology-order-basket-panel.extension";

const moduleName = "@openmrs/esm-radiology-app";

const options = {
  featureName: "openmrs/esm-radiology-app",
  moduleName,
};

export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(
  () => import("./root.component"),
  options
);

// export const radiologyDashboardLink = getSyncLifecycle(
//   createLeftPanelLink({
//     name: "radiology",
//     title: "Radiology",
//   }),
//   options
// );

// export const addRadiologyToWorklistDialogComponent = getSyncLifecycle(
//   addRadiologyToWorklistDialog,
//   options
// );



// export const radiologyOrderPanel = getSyncLifecycle(
//   RadiologyOrderBasketPanelExtension,
//   options
// );

// t('addMedicalSupplyOrderWorkspaceTitle', 'Add Medical Supply order')

export const addMedicalSupplyOrderWorkspace = getAsyncLifecycle(
  () =>
    import(
      "./form/add-medical-supply-order/medical-supply-order/add-medical-supply-order.workspace"
    ),
  options
);
