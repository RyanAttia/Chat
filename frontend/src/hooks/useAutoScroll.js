import { useEffect } from "react";

const useAutoScroll = (ref, dependencies) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [dependencies, ref]);
};

export default useAutoScroll;
