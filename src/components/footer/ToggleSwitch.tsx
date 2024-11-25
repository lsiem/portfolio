import React from "react";
import { Box, SvgIcon } from "@mui/material";
import styled from "@emotion/styled";
import { Theme } from "@mui/material/styles";

interface ToggleSwitchProps {
  theme: Theme;
  onToggle: () => void;
}

const SwitchContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => (theme as Theme).spacing(1)};
`;

const ThemeIcon = styled(SvgIcon)`
  color: ${({ theme }) => (theme as Theme).palette.text.primary};
  width: 20px;
  height: 20px;
`;

const CheckboxInput = styled.input`
  height: 0;
  width: 0;
  visibility: hidden;
  position: absolute;
`;

const SwitchLabel = styled.label<{ $mode: "light" | "dark" }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 60px;
  height: 30px;
  background: ${({ $mode }) => ($mode === "light" ? "#c9d1d9" : "#8b949e")};
  border-radius: 80px;
  position: relative;
  transition: background-color 0.2s;

  @media screen and (max-width: 768px) {
    width: 50px;
    height: 26px;
  }
`;

const SwitchButton = styled.span<{ $isChecked: boolean; $bgColor: string }>`
  content: "";
  position: absolute;
  top: 2px;
  left: ${(props) => (props.$isChecked ? "calc(100% - 28px)" : "2px")};
  width: 26px;
  height: 26px;
  border-radius: 26px;
  transition: 0.2s;
  background: ${({ $bgColor }) => $bgColor};
  box-shadow: 0 0 2px 0 rgba(10, 10, 10, 0.29);

  @media screen and (max-width: 768px) {
    width: 22px;
    height: 22px;
    left: ${(props) => (props.$isChecked ? "calc(100% - 24px)" : "2px")};
  }
`;

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ theme, onToggle }) => {
  const isOn = theme.palette.mode === "dark";

  return (
    <SwitchContainer>
      <ThemeIcon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </ThemeIcon>
      <div style={{ position: "relative" }}>
        <CheckboxInput
          checked={isOn}
          onChange={onToggle}
          id="react-switch-new"
          type="checkbox"
        />
        <SwitchLabel $mode={theme.palette.mode} htmlFor="react-switch-new">
          <SwitchButton
            $isChecked={isOn}
            $bgColor={theme.palette.background.default}
          />
        </SwitchLabel>
      </div>
      <ThemeIcon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </ThemeIcon>
    </SwitchContainer>
  );
};

export default ToggleSwitch;
