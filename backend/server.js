import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import { config } from "./src/config/config.js";

connectToDB();

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`app is listening on ${PORT}`);
});
