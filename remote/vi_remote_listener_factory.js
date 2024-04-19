/*

  VISUAL INTERACTION SYSTEMS

  Fabrica de Listeners Remotos


  Opciones :

      - FIREBASE
      - GOOGLE SPREADSHEET
      - MQTT
      - RABBT QTT
      - Sockets
      - MSSQL


*/

import vi_FirebaseListener from "./vi_firebase_listener.js";
import vi_GoogleSheetListener from "./vi_google_sheet_listener.js";
import vi_aws_mqtt_listener from "./vi_aws_mqtt_listener.js";
import vi_MSSQL_Listener from "./vi_mssql_listener.js";

class vi_RemoteListenerFactory {
    createRemoteListener(dataSource, model) {
      switch (dataSource.sourceType) {
        case 'Firebase':

           
          return new vi_FirebaseListener(dataSource, model);
          break;

        case 'GoogleSheet':  

          return new vi_GoogleSheetListener(dataSource, model);
          break;

        case 'MSSQL':  

          return new vi_MSSQL_Listener(dataSource, model);
          break;

        case 'aws-mqtt':  

          return new vi_aws_mqtt_listener(dataSource, model);
          break;

        default:
          throw new Error(`Unsupported data source type: ${type}`);
      }
    }
  }

  export default vi_RemoteListenerFactory;