import { createContext, useContext, type ReactNode } from "react";
import type { HouseholdMember } from "@homeslate/schema";

interface HouseholdContextValue {
  provided: boolean;
  members: HouseholdMember[];
  onMembersChange?: (members: HouseholdMember[]) => void;
  readOnly: boolean;
}

const HouseholdContext = createContext<HouseholdContextValue>({
  provided: false,
  members: [],
  readOnly: true,
});

export function HouseholdProvider({
  members,
  onMembersChange,
  readOnly = false,
  children,
}: {
  members: HouseholdMember[];
  onMembersChange?: (members: HouseholdMember[]) => void;
  readOnly?: boolean;
  children: ReactNode;
}) {
  return (
    <HouseholdContext.Provider
      value={{
        provided: true,
        members,
        onMembersChange,
        readOnly: readOnly || !onMembersChange,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold(): HouseholdContextValue {
  return useContext(HouseholdContext);
}
