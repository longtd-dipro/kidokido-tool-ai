import { useEffect, useState } from "react";

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowSize(); // as soon as we are on the client, run this handler

    window.addEventListener("resize", updateWindowSize); // works only on resize events

    return () => {
      window.removeEventListener("resize", updateWindowSize); // clean up
    };
  }, []);

  const isDesktopSize = windowSize.width >= 1440;
  const isFromTabletSize = windowSize.width >= 768;

  return { windowSize, isDesktopSize, isFromTabletSize };
}
