import { useCallback, useEffect, useRef, useState } from "react";
import { Snack, SnackProps } from "@/core-react";
import { Optional } from "@core";

type OpenSnackProps = Partial<Omit<SnackProps, "visible">> & {
  duration?: number;
  onClick?: () => void;
};
type OpenSnack = (pr?: OpenSnackProps) => void;

/* returns a tuple with the open function and the Snack component
 * place the snack component where you want it to appear
 * set the direction to 'up' if you want it to pop up from that spot and 'down' if you want it to pop down from that spot.
 * It will appear as if it is sliding in and hide after duration (default 2000ms)
 * props can be set in the hook or overridden when calling the open function, so the snack can show different messages and for different durations.
 */
export function useSnack(props: OpenSnackProps) {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState(props.content || "");
  const [duration, setDuration] = useState(props.duration || 2000);
  const [direction, setDirection] = useState(props.direction || "down");
  const [onClick, setOnClick] = useState(() => props.onClick);
  const timeout = useRef<Optional<number>>(undefined);

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  const open = useCallback(
    (pr?: OpenSnackProps) => {
      let dur = duration;
      if (pr) {
        if (pr.content) {
          setContent(pr.content);
        }
        if (pr.direction) {
          setDirection(pr.direction);
        }
        if (pr.duration) {
          dur = pr.duration;
          setDuration(pr.duration);
        }
        if (pr.onClick) {
          setOnClick(() => pr.onClick);
        }
      }
      setVisible(true);
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(() => setVisible(false), dur);
    },
    [setContent, setDuration, setDirection, setVisible, duration],
  );

  const innerProps = { content, visible, direction, duration, onClick };
  const snack = <Snack {...innerProps} />;

  return [open, snack] as [OpenSnack, typeof snack];
}
