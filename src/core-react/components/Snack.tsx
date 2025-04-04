import { FC } from "react";

export type SnackProps = {
  content: string;
  visible: boolean;
  direction: string;
  duration: number;
  onClick?: () => void;
};

export const Snack: FC<SnackProps> = ({ content, visible, onClick }) => {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 10,
          borderRadius: 5,
          margin: 10,
          marginBottom: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          transform: `translateY(${visible ? 0 : 100}%)`,
        }}
      >
        <div style={{ color: "white" }}>{content}</div>
        <button onClick={onClick}>
          <div style={{ color: "white" }}>X</div>
        </button>
      </div>
    </div>
  );
};
