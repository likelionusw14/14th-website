"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = Field;
exports.FieldLabel = FieldLabel;
exports.FieldDescription = FieldDescription;
exports.FieldError = FieldError;
exports.FieldGroup = FieldGroup;
exports.FieldLegend = FieldLegend;
exports.FieldSeparator = FieldSeparator;
exports.FieldSet = FieldSet;
exports.FieldContent = FieldContent;
exports.FieldTitle = FieldTitle;
const react_1 = require("react");
const class_variance_authority_1 = require("class-variance-authority");
const utils_1 = require("@/lib/utils");
const label_1 = require("@/components/ui/label");
const separator_1 = require("@/components/ui/separator");
function FieldSet({ className, ...props }) {
    return (<fieldset data-slot="field-set" className={(0, utils_1.cn)("gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3 flex flex-col", className)} {...props}/>);
}
function FieldLegend({ className, variant = "legend", ...props }) {
    return (<legend data-slot="field-legend" data-variant={variant} className={(0, utils_1.cn)("mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base", className)} {...props}/>);
}
function FieldGroup({ className, ...props }) {
    return (<div data-slot="field-group" className={(0, utils_1.cn)("gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4 group/field-group @container/field-group flex w-full flex-col", className)} {...props}/>);
}
const fieldVariants = (0, class_variance_authority_1.cva)("data-[invalid=true]:text-destructive gap-3 group/field flex w-full", {
    variants: {
        orientation: {
            vertical: "flex-col [&>*]:w-full [&>.sr-only]:w-auto",
            horizontal: "flex-row items-center [&>[data-slot=field-label]]:flex-auto has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
            responsive: "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto @md/field-group:[&>[data-slot=field-label]]:flex-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        },
    },
    defaultVariants: {
        orientation: "vertical",
    },
});
function Field({ className, orientation = "vertical", ...props }) {
    return (<div role="group" data-slot="field" data-orientation={orientation} className={(0, utils_1.cn)(fieldVariants({ orientation }), className)} {...props}/>);
}
function FieldContent({ className, ...props }) {
    return (<div data-slot="field-content" className={(0, utils_1.cn)("gap-1 group/field-content flex flex-1 flex-col leading-snug", className)} {...props}/>);
}
function FieldLabel({ className, ...props }) {
    return (<label_1.Label data-slot="field-label" className={(0, utils_1.cn)("has-data-checked:bg-primary/5 has-data-checked:border-primary dark:has-data-checked:bg-primary/10 gap-2 group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-3 group/field-label peer/field-label flex w-fit leading-snug", "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col", className)} {...props}/>);
}
function FieldTitle({ className, ...props }) {
    return (<div data-slot="field-label" className={(0, utils_1.cn)("gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50 flex w-fit items-center leading-snug", className)} {...props}/>);
}
function FieldDescription({ className, ...props }) {
    return (<p data-slot="field-description" className={(0, utils_1.cn)("text-muted-foreground text-left text-sm [[data-variant=legend]+&]:-mt-1.5 leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance", "last:mt-0 nth-last-2:-mt-1", "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4", className)} {...props}/>);
}
function FieldSeparator({ children, className, ...props }) {
    return (<div data-slot="field-separator" data-content={!!children} className={(0, utils_1.cn)("-my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2 relative", className)} {...props}>
      <separator_1.Separator className="absolute inset-0 top-1/2"/>
      {children && (<span className="text-muted-foreground px-2 bg-background relative mx-auto block w-fit" data-slot="field-separator-content">
          {children}
        </span>)}
    </div>);
}
function FieldError({ className, children, errors, ...props }) {
    const content = (0, react_1.useMemo)(() => {
        if (children) {
            return children;
        }
        if (!errors?.length) {
            return null;
        }
        const uniqueErrors = [
            ...new Map(errors.map((error) => [error?.message, error])).values(),
        ];
        if (uniqueErrors?.length == 1) {
            return uniqueErrors[0]?.message;
        }
        return (<ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>);
    }, [children, errors]);
    if (!content) {
        return null;
    }
    return (<div role="alert" data-slot="field-error" className={(0, utils_1.cn)("text-destructive text-sm font-normal", className)} {...props}>
      {content}
    </div>);
}
