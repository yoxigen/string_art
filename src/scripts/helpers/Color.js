const COLOR_CONTROLS = [
    {
        key: 'color',
        label: 'String color',
        defaultValue: "#ff4d00",
        type: "color",
        show: ({isMultiColor}) => !isMultiColor
    },
    {
        key: 'isMultiColor',
        label: 'Use multiple colors',
        defaultValue: false,
        type: "checkbox",
    },
    {
        key: 'multicolorRange',
        label: 'Multicolor range',
        defaultValue: 360,
        type: "range",
        attr: {
            min: 1,
            max: 360,
            step: 1
        },
        show: ({isMultiColor}) => isMultiColor
    },
    {
        key: 'multicolorStart',
        label: 'Multicolor start',
        defaultValue:0,
        type: "range",
        attr: {
            min: 0,
            max: 360,
            step: 1
        },
        show: ({isMultiColor}) => isMultiColor
    },
    {
        key: 'reverseColors',
        label: 'Reverse colors order',
        defaultValue: false,
        type: "checkbox",
        show: ({isMultiColor}) => isMultiColor
    },
    {
        key: 'saturation',
        label: 'Saturation',
        defaultValue: 100,
        type: "range",
        attr: {
            min: 0,
            max: 100,
            step: 1
        },
        show: ({isMultiColor}) => isMultiColor
    },
    {
        key: 'lightness',
        label: 'Lightness',
        type: 'group',
        defaultValue: 'minimized',
        show: ({isMultiColor}) => isMultiColor,
        children: [
            {
                key: 'multicolorByLightness',
                label: 'Multi lightness',
                defaultValue: false,
                type: 'checkbox',
                show: ({isMultiColor}) => isMultiColor
            },
            {
                key: 'minLightness',
                label: 'Minimum lightness',
                defaultValue:0,
                type: "range",
                attr: {
                    min: 0,
                    max: 100,
                    step: 1
                },
                show: ({multicolorByLightness, isMultiColor}) => multicolorByLightness && isMultiColor
            },
            {
                key: 'maxLightness',
                label: 'Maximum lightness',
                defaultValue:100,
                type: "range",
                attr: {
                    min: 0,
                    max: 100,
                    step: 1
                },
                show: ({multicolorByLightness, isMultiColor}) => multicolorByLightness && isMultiColor
            },
        ]
    },
];

export default class Color {
    constructor(config) {
        this.config = config;
        const {
            multicolorRange,
            colorCount,
            multicolorByLightness,
            minLightness = 0,
            maxLightness = 100,
            multicolorStart,
            darkMode,
            saturation,
            reverseColors,
            isMultiColor,
        } = config;
        
        if (isMultiColor) {
            this.multiColorStep = multicolorRange / colorCount;
            this.multiColorLightnessStep = multicolorByLightness ? (maxLightness - minLightness) / colorCount : 1;

            this.colors = new Array(colorCount).fill(null).map((_, colorIndex) => {
                const lightness = multicolorByLightness ? minLightness + this.multiColorLightnessStep * colorIndex : darkMode ? 50 : 40;
                return `hsl(${multicolorStart + colorIndex * this.multiColorStep}, ${saturation}%, ${lightness}%)`;
            });

            if (reverseColors) {
                this.colors.reverse();
            }
        }
    }

    /**
     * Returns the color to be used in the provided layer index. If no multiColor is used, will use the 'color' config property. 
     * @param {number} colorIndex 
     * @returns string
     */
    getColor(colorIndex) {
        const {
            isMultiColor,
            colorCount,
            color,
        } = this.config;
    
        if (!isMultiColor) {
            return color;
        }

        if (colorIndex >= colorCount) {
            colorIndex = colorCount - 1;
        }

        return this.colors[colorIndex];
    }
   
    static getConfig({ include, exclude, defaults = {}}) {
        const controls = COLOR_CONTROLS
            .filter(({key}) => (!exclude || !exclude.includes(key)) && (!include || include.includes(key)))
            .map(control => ({
                ...control,
                defaultValue: defaults[control.key] ?? control.defaultValue,
            }));

        return {
            key: 'colorGroup',
            label: 'Color',
            type: 'group',
            children: controls
        };
    }
}