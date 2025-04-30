// import { initializeApp } from "firebase/app";
// import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyC_3qNL9YhZNYVRYasINlSdi8_gAEa2vdw",
//   authDomain: "mlmproject-8d44b.firebaseapp.com",
//   projectId: "mlmproject-8d44b",
//   storageBucket: "mlmproject-8d44b.appspot.com",
//   messagingSenderId: "635906307296",
//   appId: "1:635906307296:web:b3c9b2946bbc65d64f0c85",
//   measurementId: "G-Y9DRJFGC6T",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firestore with **AutoDetect LongPolling**
// export const db = initializeFirestore(app, {
//   localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
//   experimentalForceLongPolling: true, // ✅ Only this, do NOT use experimentalForceLongPolling
// });

// // Initialize Storage
// export const storage = getStorage(app);
import { initializeApp } from "firebase/app";
import { initializeFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_3qNL9YhZNYVRYasINlSdi8_gAEa2vdw",
  authDomain: "mlmproject-8d44b.firebaseapp.com",
  projectId: "mlmproject-8d44b",
  storageBucket: "mlmproject-8d44b.appspot.com",
  messagingSenderId: "635906307296",
  appId: "1:635906307296:web:b3c9b2946bbc65d64f0c85",
  measurementId: "G-Y9DRJFGC6T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore without persistence
export const db = initializeFirestore(app, {
  // Do not provide localCache to disable persistence
  experimentalForceLongPolling: true,  // Only use if necessary
});

// Initialize Storage
export const storage = getStorage(app);

// Optionally, enable or disable network based on the debugging need
enableNetwork(db).catch((error) => {
  console.log("Error enabling network:", error);
});

// Disable network if you need to simulate offline behavior
// disableNetwork(db).catch((error) => {
//   console.log("Error disabling network:", error);
// });

