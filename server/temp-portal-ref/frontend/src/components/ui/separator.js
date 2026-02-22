"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Separator = Separator;
const separator_1 = require("@base-ui/react/separator");
const utils_1 = require("@/lib/utils");
function Separator({ className, orientation = "horizontal", ...props }) {
    return (<separator_1.Separator data-slot="separator" orientation={orientation} className={(0, utils_1.cn)("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch", className)} {...props}/>);
}
