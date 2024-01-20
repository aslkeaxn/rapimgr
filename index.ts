import { register } from "./src/register";
import { login } from "./src/login";
import { subscribe } from "./src/subscribe";
import osecmail from "osecmail";
import fxrmc from "fxrmc";

const rapimgr = {
  register,
  login,
  subscribe,
};

export default rapimgr;

osecmail.generateRandomMailboxes(1).then((mbxs) => {
  const password = "Rapid123456*";
  const mbx = mbxs[0];
  const [login, domain] = mbx.split("@");

  fxrmc(mbx, password)
    .then((mask) => {
      const username = mask.split("@")[0];

      rapimgr
        .register(username, mask, password, login, domain)
        .catch(console.error);
    })
    .catch(console.error);
});
