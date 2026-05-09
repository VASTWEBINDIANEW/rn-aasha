import { createContext, Dispatch, SetStateAction } from "react";
import noop from 'lodash/noop'
export type RadiantContext = {
    setCurrentPage: Dispatch<SetStateAction<number | undefined>>;
    currentPage: number;

};
export const RadiantContext = createContext<RadiantContext>({
    currentPage: 0,
    setCurrentPage: noop,
});