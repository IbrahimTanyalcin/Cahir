function renderStyles(values){
    return  `
        @font-face {
            font-family: 'angel';
            src: url('/static/gwent-chain/fonts/angel.ttf');
        }
        :root {
            background-color: black;
            height: 100%;
            font-family: Georgia, serif;
        }
        * {
            box-sizing: border-box;
        }
        ${"#" + values.contId} {
            position: relative;
            width: calc(max(320px, 60vw));
            //outline: 2px solid red;
        }
        body {
            position: relative;
            display:flex;
            align-items: flex-start;
            justify-content: center;
            flex-direction: row;
            flex-wrap: wrap;
            width: 100%;
            min-height: 100vh;
            margin: 0;
            font-family: sans-serif;
        }
        @keyframes fadeInDown {
            0% {
                opacity: 0;
                -webkit-transform: translate3d(0, -100%, 0);
                transform: translate3d(0, -100%, 0);
            }
            to {
                opacity: 1;
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }
        }
        .fadeInDown {
            -webkit-animation-name: fadeInDown;
            animation-name: fadeInDown;
        }
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                -webkit-transform: translate3d(0, 100%, 0);
                transform: translate3d(0, 100%, 0);
            }
            to {
                opacity: 1;
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }
        }
        .fadeInUp {
            -webkit-animation-name: fadeInUp;
            animation-name: fadeInUp;
        }
        @keyframes fadeOutDown {
            0% {
                opacity: 1;
            }
            to {
                opacity: 0;
                -webkit-transform: translate3d(0, 100%, 0);
                transform: translate3d(0, 100%, 0);
            }
        }
        .fadeOutDown {
            -webkit-animation-name: fadeOutDown;
            animation-name: fadeOutDown;
        }
        .animated {
            -webkit-animation-duration: 1s;
            animation-duration: 1s;
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
        }
        .item {
            ${values.item}
        }
        .card-body::first-letter {
            font-family: 'angel';
            font-size: 4rem;
            text-transform: uppercase;
        }
        h1,h2,h3 {
            margin: 0;
        }
    `
}

export const render = renderStyles;