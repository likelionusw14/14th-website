"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select = void 0;
exports.SelectContent = SelectContent;
exports.SelectGroup = SelectGroup;
exports.SelectItem = SelectItem;
exports.SelectLabel = SelectLabel;
exports.SelectScrollDownButton = SelectScrollDownButton;
exports.SelectScrollUpButton = SelectScrollUpButton;
exports.SelectSeparator = SelectSeparator;
exports.SelectTrigger = SelectTrigger;
exports.SelectValue = SelectValue;
const React = __importStar(require("react"));
const select_1 = require("@base-ui/react/select");
const utils_1 = require("@/lib/utils");
const react_1 = require("@hugeicons/react");
const core_free_icons_1 = require("@hugeicons/core-free-icons");
const Select = select_1.Select.Root;
exports.Select = Select;
function SelectGroup({ className, ...props }) {
    return (<select_1.Select.Group data-slot="select-group" className={(0, utils_1.cn)("scroll-my-1 p-1", className)} {...props}/>);
}
function SelectValue({ className, ...props }) {
    return (<select_1.Select.Value data-slot="select-value" className={(0, utils_1.cn)("flex flex-1 text-left", className)} {...props}/>);
}
function SelectTrigger({ className, size = "default", children, ...props }) {
    return (<select_1.Select.Trigger data-slot="select-trigger" data-size={size} className={(0, utils_1.cn)("border-input data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 gap-1.5 rounded-md border bg-transparent py-2 pr-2 pl-2.5 text-sm shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] aria-invalid:ring-[3px] data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-4 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} {...props}>
      {children}
      <select_1.Select.Icon render={<react_1.HugeiconsIcon icon={core_free_icons_1.UnfoldMoreIcon} strokeWidth={2} className="text-muted-foreground size-4 pointer-events-none"/>}/>
    </select_1.Select.Trigger>);
}
function SelectContent({ className, children, side = "bottom", sideOffset = 4, align = "center", alignOffset = 0, alignItemWithTrigger = true, ...props }) {
    return (<select_1.Select.Portal>
      <select_1.Select.Positioner side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset} alignItemWithTrigger={alignItemWithTrigger} className="isolate z-50">
        <select_1.Select.Popup data-slot="select-content" className={(0, utils_1.cn)("bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 min-w-36 rounded-md shadow-md ring-1 duration-100 relative isolate z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto", className)} {...props}>
          <SelectScrollUpButton />
          <select_1.Select.List>{children}</select_1.Select.List>
          <SelectScrollDownButton />
        </select_1.Select.Popup>
      </select_1.Select.Positioner>
    </select_1.Select.Portal>);
}
function SelectLabel({ className, ...props }) {
    return (<select_1.Select.GroupLabel data-slot="select-label" className={(0, utils_1.cn)("text-muted-foreground px-2 py-1.5 text-xs", className)} {...props}/>);
}
function SelectItem({ className, children, ...props }) {
    return (<select_1.Select.Item data-slot="select-item" className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} {...props}>
      <select_1.Select.ItemText className="flex flex-1 gap-2 shrink-0 whitespace-nowrap">
        {children}
      </select_1.Select.ItemText>
      <select_1.Select.ItemIndicator render={<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center"/>}>
        <react_1.HugeiconsIcon icon={core_free_icons_1.Tick02Icon} strokeWidth={2} className="pointer-events-none"/>
      </select_1.Select.ItemIndicator>
    </select_1.Select.Item>);
}
function SelectSeparator({ className, ...props }) {
    return (<select_1.Select.Separator data-slot="select-separator" className={(0, utils_1.cn)("bg-border -mx-1 my-1 h-px pointer-events-none", className)} {...props}/>);
}
function SelectScrollUpButton({ className, ...props }) {
    return (<select_1.Select.ScrollUpArrow data-slot="select-scroll-up-button" className={(0, utils_1.cn)("bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4 top-0 w-full", className)} {...props}>
      <react_1.HugeiconsIcon icon={core_free_icons_1.ArrowUp01Icon} strokeWidth={2}/>
    </select_1.Select.ScrollUpArrow>);
}
function SelectScrollDownButton({ className, ...props }) {
    return (<select_1.Select.ScrollDownArrow data-slot="select-scroll-down-button" className={(0, utils_1.cn)("bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4 bottom-0 w-full", className)} {...props}>
      <react_1.HugeiconsIcon icon={core_free_icons_1.ArrowDown01Icon} strokeWidth={2}/>
    </select_1.Select.ScrollDownArrow>);
}
