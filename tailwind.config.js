export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                iris: {
                    100: "#5A120D",  // primary deep wine
                    80:  "#76160E",  // main brand color
                    60:  "#481714",  // lighter accent
                },
                fuschia: {
                    100: "#671510",  // button
                    80:  "#80231d",  // hover
                    60:  "#F4D4D2",  // soft tint
                },

                wine: {
                    100: "#500d08",  // button
                    80:  "#6e1710",  // hover
                    60:  "#F4D4D2",  // soft tint

                },

                beige: "#e8e3df",
            },
        },
    },
}
