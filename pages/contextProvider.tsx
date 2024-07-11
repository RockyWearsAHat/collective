import { createContext } from "react";

interface ActiveContextInterface {
  active: string;
  setActive: (active: string) => void;
}

export const ActiveContext = createContext<ActiveContextInterface>({
  active: "",
  setActive: function (active: string) {
    this.active = active;
  }
});
