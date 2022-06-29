    // ==UserScript==
    // @name         SonDerece Slither.io Mod
    // @version      1
    // @description  Slither.io Mod
    // @author       SonDerece
    // @match        http://slither.io/*
    // @run-at       document-body
    // @grant        none
    // ==/UserScript==

    window.c;

    (function(w) {
        Object.prototype.SetStyleObject = function(styleObject){
            for (var key in styleObject)
            {
                this.style[key] = styleObject[key];
            }
        };
        let modVersion = "v1.5",
            renderMode = 3, // 3 - normal, 2 - optimized, 1 - simple (mobile)
            normalMode = false,
            gameFPS = undefined,
            positionHUD = undefined,
            ipHUD = undefined,
            fpsHUD = undefined,
            login = undefined,
            inpNick = undefined,
            currentIP = undefined,
            bgImage = undefined,
            retry = 0;


        const crosshair = {
                enabled: true,
                size: 35,
                radius: 130,
                offset: (35 / 2) + 7,
        };
        const crosshairMenu = {
            element: undefined,
            size: undefined,
            radius: undefined,
            toggleButton: undefined,
        };

        let CrosshairElement = undefined,
            crosshairSize = undefined,
            crosshairRadius = undefined,
            crosshairToggle = undefined,
            mouseLoop = undefined,
            SettingsButton = undefined,
            SettingsButtonOuter = undefined,
            SettingsMenuElement = undefined;

        function GetGlobalsFromStorage()
        {
            const size = window.localStorage.getItem("crosshair_size");
            const radius = window.localStorage.getItem("crosshair_radius");
            const enabled = window.localStorage.getItem("crosshair_enabled");
            if(size) crosshair.size = size;
            if(radius) crosshair.radius = radius;
            if(enabled) crosshair.enabled = JSON.parse(enabled);
        }


        GetGlobalsFromStorage();


        function create(type){
            return function(id, className, style){
                let div = document.createElement(type);
                    div.SetStyleObject(style);
                    if(id) div.id = id;
                    if(className) div.class = className;
                return div;
            }
        }

        function init() {
            const style = {
                hud: {
                    color: "#FFF",
                    fontFamily: "Arial",
                    fontSize: "20px",
                    position: "fixed",
                    opacity: 1,
                    zIndex: 7
                },
                crosshair: {
                    width: crosshair.size + "px",
                    height: crosshair.size + "px",
                    display: "none",
                    pointerEvents: "none",
                    zIndex: 999,
                    position: "absolute",
                    transform: "translate(" + window.innerWidth / 2 + "px,"+ window.innerHeight / 2 + "px)"
                }
            };

            const createDiv = create("div");
            const createImg = create("img");

            positionHUD = createDiv("position-hud", "nsi", {...style.hud, right: "30", bottom: "120px"});
            document.body.appendChild(positionHUD);

            ipHUD = createDiv("ip-hud", "nsi", {...style.hud, right: "30", top:"220px"});
            document.body.appendChild(ipHUD);

            fpsHUD = createDiv("fps-hud", "nsi", {...style.hud, right: "30", top: "250px"});
            document.body.appendChild(fpsHUD);

            CrosshairElement = createImg("CrosshairElement", "nsi", style.crosshair)
            CrosshairElement.setAttribute("src", "https://i.imgur.com/R7JMiL1.png")
            CrosshairElement.size = function(crosshair_size){this.style["width"] = crosshair_size + "px"; this.style["height"] = crosshair_size + "px"}
            document.body.appendChild(CrosshairElement);

            // Add zoom
            if (/firefox/i.test(navigator.userAgent)) {
                document.addEventListener("DOMMouseScroll", zoom, false);
            } else {
                document.body.onmousewheel = zoom;
            }
            window.addEventListener("keydown", function(e) {
                switch(e.keyCode) {
                    // ESC - quick resp
                    case 27: forceConnect();
                        break;
                    // A - Auto skin rotator
                    case 65: rotate = !rotate; rotateSkin();
                        break;
                    // Q - Quit to menu
                    case 81: quit();
                        break;
                    // S - Change skin
                    case 83: changeSkin();
                        break;
                    // Z - Reset zoom
                    case 32: resetZoom();
                        break;
                }
            }, false);
            // Set menu
            setMenu();
            // Set leaderboard
            setLeaderboard();
            // Set graphics
            setGraphics();
            // Update loop
            updateLoop();
            // Show FPS
            showFPS();
        }

        function AnimateOpacity(object, duration, bsteps = 50)
        {
                let opacity = 0;
                const steps = (1 / duration) * (bsteps / 1000);
                (function MyFadeFunction() {
                    if (opacity<1) {
                    opacity += steps;
                    setTimeout(function(){MyFadeFunction()},bsteps);
                    }
                    object.style.opacity = opacity > 0.5 ? 4*Math.pow((opacity-1),3)+1 : 4*Math.pow(opacity,3);
                })();
        }
        function ShowCrosshair()
        {
            CrosshairElement.style['display'] = "block"
            updateMousePositon();
        }
        function HideCrosshair()
        {
            CrosshairElement.style['display'] = "none";
            ClearMousePosition()
        }
        startShowGame = function(){
            //internal code;
            llgmtm = Date.now();
            login_iv = setInterval(loginFade, 25);
            mc.style.opacity = 0;
            mc.style.display = "inline";
            lbh.style.opacity = lbs.style.opacity = lbn.style.opacity = lbp.style.opacity = lbf.style.opacity = vcm.style.opacity = 0;
            loch.style.opacity = 0;
            lb_fr = -1

            //functions
            if(crosshair.enabled)
            {
                ShowCrosshair();
                OnGameOver();
            }
        }
        function OnGameOver(){
            let timer = setInterval(() => {
                if (window.dead_mtm > -1){
                    HideCrosshair();
                    clearInterval(timer)
                }
            }, 2400)
        }

        // Zoom
        const Zoom = {
            Level: 0.9,
            Reset: true,
            Default: 0.9
        }

        function zoom(e) {
            if (!window.gsc) return;
            window.gsc *= Math.pow(0.9, e.wheelDelta / -120 || e.detail / 2 || 0);
            Zoom.Level = window.gsc;
            Zoom.Reset = false;

        }
            // Reset zoom
        function resetZoom() {
            if(Zoom.Reset){
                window.gsc = Zoom.Level;
                Zoom.Reset = false;
            } else {
                window.gsc = Zoom.Default;
                Zoom.Reset = true;
            }
        }
        // Set menu
        function setMenu() {
            login = document.getElementById("login");
            if (login) {
                // Load settings
                loadSettings();
                // Message
                const styles =  {
                    1:{
                        width: "300px",
                        color: "#FFF",
                        fontFamily: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
                        fontSize: "14px",
                        textAlign: "center",
                        opacity: "0.5",
                        margin: "0 auto",
                        padding: "10px 0"
                    },
                    Menu_container:{
                        position: "relative",
                        width:"260px",
                        color:"#8058D0",
                        backgroundColor:"#1e262e",
                        borderRadius:"29px",
                        fontFamily:"'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
                        fontSize:"14px",
                        textAlign:"center",
                        margin:"0 auto 100px auto",
                        padding:"10px 14px"
                    },
                    IP_input_container: {
                        color:"#8058D0",
                        backgroundColor:"#919191",
                        borderRadius:"29px",
                        margin:"10 auto",
                        padding:"8px"
                    },
                    IP_input: {
                        height:"24px",
                        display:"inline-block",
                        background:"none",
                        border:"none",
                        outline:"none",
                        textAlign:"center"
                    },
                    play_button: {
                        height:"24px",
                        display:"inline-block",
                        borderRadius:"12px",
                        color:"#FFF",
                        backgroundColor:"#56ac81",
                        border:"none",
                        outline:"none",
                        cursor:"pointer",
                        padding:"0 20px"
                    },
                    Select_server_container: {
                        backgroundColor:"#919191",
                        borderRadius:"29px",
                        margin:"10 auto",
                        padding:"8px"
                    },
                    Select_server: {
                        background:"none",
                        border:"none",
                        outline:"none"
                    },
                    Select_graph_container:{
                        backgroundColor:"#A5A5A5",
                        borderRadius:"29px",
                        margin:"10 auto",
                        padding:"8px"
                    },
                    Select_graph: {
                        background:"none",
                        border:"none",
                        outline:"none"
                    },
                }
                const createDiv = create('div');
                const createInput = create("input");
                const createSelect = create("select");
                const createOption = create("option");

                var div = createDiv(undefined, undefined, styles['1']);
                    div.innerHTML += '<a target="_blank" style="color: #56ac81; opacity: 2;">| Q <strong>→</strong> Back to main menu |<br/> | SPACE <strong>→</strong> Reset Zoom |<br/> | ESC <strong>→</strong> Quick Restart |<br/> | S <strong>→</strong> Change Skin |</a>';
                    login.appendChild(div);
                var sltMenu = createDiv("ServerMenu", undefined, styles.Menu_container);
                    sltMenu.innerHTML = "Slither.io Mod";
                    login.appendChild(sltMenu);
                var div = createDiv(undefined, undefined, styles.IP_input_container)
                    sltMenu.appendChild(div);
                var input = createInput("server-ip", undefined, styles.IP_input)
                    input.type = "text";
                    input.placeholder = "Server Address";
                    div.appendChild(input);
                var button = createInput("connect-btn", undefined, styles.play_button)
                    button.type = "button";
                    button.value = "Play";
                    div.appendChild(button);
                var div = createDiv(undefined, undefined, styles.Select_server_container)
                    sltMenu.appendChild(div);
                var select = createSelect("select-srv", undefined, styles.Select_server)
                var option = document.createElement("option");
                    option.value = "";
                    option.text = "★ Server Selection ★";

                select.appendChild(option);
                div.appendChild(select);

                var div = createDiv(undefined, undefined, styles.Select_graph_container)
                    sltMenu.appendChild(div);
                var select = createSelect("select-graph", undefined, styles.Select_graph);
                    div.appendChild(select);
                var option = document.createElement("option");
                    option.value = "3";
                    option.text = "Graphics: Normal ✓";
                    select.appendChild(option);
                var option = document.createElement("option");
                    option.value = "2";
                    option.text = "Graphics: Optimized ✓";
                select.appendChild(option);

                var option = document.createElement("option");
                    option.value = "1";
                    option.text = "Graphics: Low ✓";
                select.appendChild(option);

                inpIP = document.getElementById("server-ip");
                var nick = document.getElementById("nick");

                nick.addEventListener("input", getNick, false);
                button.addEventListener("click", forceConnect)
                getServersList();

                var selectGraph = document.getElementById("select-graph");
                if (renderMode == 1)
                {
                    selectGraph.selectedIndex = 2;
                }
                else if (renderMode == 2)
                {
                    selectGraph.selectedIndex = 1;
                } else {
                    selectGraph.selectedIndex = 0;
                    normalMode = true;
                }

                selectGraph.onchange = function() {
                    var mode = selectGraph.value;
                    if (mode) {
                        renderMode = mode;
                        localStorage.setItem("rendermode", renderMode);
                    }
                };
                resizeView();
                CreateSettingsMenu();

            } else {
                setTimeout(setMenu, 100);
            }
        }
        const Settings = {
                Button: {
                    IconSize: 50,
                    IconPadding: 15,
                    IconUrl: "https://i.imgur.com/SCG9Kwk.png",
                    backgroundColor: "gray",
                    BorderRadius: 50
                },
                Menu: {
                    Padding: 10,
                    Width: 250,
                },
                Setting: {
                    Height: 33,
                    Width: 87,
                    BorderSize: 100,
                    Margin: 12,
                    HeaderWidth: undefined,
                    InputWidth: 30
                },
                RadioButton: {
                    Color: "#b7b7b7",
                    ToggleOnColor: "#56ac81",
                    ToggleOffColor: "#ac5656"
                },
                InputField: {
                    BackgroundColor: "#7a3fd5",
                    Color: "green"
                },
                Input:
                {
                    HeaderWidth: undefined,
                    Width: 30,
                    FontSize: 13,
                },
                SetHeaderWidth: function(){
                    this.Input.HeaderWidth = (this.Menu.Width * (this.Setting.Width * 0.01));
                },

                SettingsMenu_BG: "#1E262E"
        };

        Settings.SetHeaderWidth();


        function CreateSetting(InputId, DefaultText, DefaultInputText, SettingType = "input")
        {
            const Stylesheets = {
                SettingOuter:{
                    "textAlign": "left",
                    "width": Settings.Setting.Width + "%",
                    "height": Settings.Setting.Height + "px",
                    "margin": "10px auto",
                    "backgroundColor": "gray",
                    "borderRadius": (Settings.Setting.Height / 2) * (Settings.Setting.BorderSize * 0.01) + "px",
                    "position": "relative",
                    "overflow": "hidden"
                },
                SettingInner_TextWrapper:{
                    "width": Settings.Input.HeaderWidth * ((100 - Settings.Input.Width) * 0.01) + "px",
                    "height": Settings.Setting.Height + "px",
                    "display": "inline-block"
                },
                SettingInner_Text:{
                    "line-height": Settings.Setting.Height + "px",
                    "display": "table-cell",
                    "paddingLeft": "20px",
                    "fontSize": Settings.Input.FontSize + "px",
                    "color": "black"
                },
                SettingInner_InputWrapper:{

                    "width": (Settings.Input.HeaderWidth * (Settings.Input.Width * 0.01)) - Settings.Setting.Margin + "px",
                    "height": Settings.Setting.Height - Settings.Setting.Margin + "px",
                    "top": (Settings.Setting.Margin / 2) + "px",
                    "right": (Settings.Setting.Margin / 2) + "px",
                    "backgroundColor": Settings.InputField.BackgroundColor,
                    "borderRadius": (Settings.Setting.Height / 2) * (Settings.Setting.BorderSize * 0.01) + "px",
                    "position": "absolute",
                    "overflow": "hidden"
                },
                SettingInner_Input:{
                    "textAlign" : "center",
                    "background": "transparent",
                    "border": "none",
                    "fontSize": "15px",
                    "color": "#d7d7d7",
                    "position": "absolute",
                    "width": "120%", "height": "120%",
                    "top": "50%", "left": "50%", "transform": "translate(-50%, -50%)"
                },
                RadioButton: {
                    "width": Settings.Setting.Height - Settings.Setting.Margin + "px",
                    "height":  Settings.Setting.Height - Settings.Setting.Margin + "px",
                    "position": "absolute",
                    "borderRadius": "50%",
                    "backgroundColor": Settings.RadioButton.Color,
                    "top": "0px",
                },
                RadioButtonWrapper: {
                    "width": "100%",
                    "height" : "100%",
                    "margin": "0px",
                    "padding": "0x",
                    "position": "relative",
                    "cursor":"pointer",
                    "backgroundColor": (crosshair.enabled ? Settings.RadioButton.ToggleOnColor : Settings.RadioButton.ToggleOffColor)

                }
            }
            if(crosshair.enabled) Stylesheets.RadioButton["right"] = "0px";
            else Stylesheets.RadioButton["left"] = "0px";

            const createDiv = create("div");
            const createParagraph = create("p");
            const createInput = create("input");

            let Setting_Outer = createDiv(undefined, "Settings", Stylesheets.SettingOuter);
            let SettingInner_TextWrapper = createDiv(undefined, "Settings", Stylesheets.SettingInner_TextWrapper);
            let SettingInner_InputWrapper = createDiv(undefined, "Settings", Stylesheets.SettingInner_InputWrapper)
                SettingInner_InputWrapper.setAttribute("inputType", SettingType)
            let SettingInner_Text = createParagraph(undefined, "Settings", Stylesheets.SettingInner_Text);
                SettingInner_Text.textContent = DefaultText;

            let SettingInner_Input = undefined;
            if(SettingType === "input")
            {
                SettingInner_Input = createInput(InputId, "Settings", Stylesheets.SettingInner_Input)
                SettingInner_Input.setAttribute("inputType", SettingType)
                SettingInner_Input.value = DefaultInputText;
            }
            else if (SettingType === "radiobutton")
            {
                RadioButtonWrapper = createDiv(InputId, "Settings", Stylesheets.RadioButtonWrapper);
                RadioButton = createDiv(undefined, "Settings", Stylesheets.RadioButton)
                    RadioButton.setAttribute("inputType", SettingType)
                    RadioButton.setAttribute("toggle", true);
                    RadioButtonWrapper.appendChild(RadioButton)
                SettingInner_Input = RadioButtonWrapper;
            }

            SettingInner_InputWrapper.appendChild(SettingInner_Input);
            SettingInner_TextWrapper.appendChild(SettingInner_Text);
            Setting_Outer.appendChild(SettingInner_TextWrapper);
            Setting_Outer.appendChild(SettingInner_InputWrapper);

            return Setting_Outer;
        }


    function CreateSettingsMenu(){
            const Stylesheet = {
                buttonOuter: {
                    "width": Settings.Button.IconSize + "PX",
                    "height": Settings.Button.IconSize + "PX",
                    "borderRadius": Settings.Button.BorderRadius + "%",
                    "position": "absolute",
                    "bottom": "0px",
                    "right": (Settings.Button.IconSize + 10) *-1 + "PX",
                    "backgroundImage": "url(" + Settings.Button.IconUrl + ")",
                    "backgroundSize": "calc(100% - "+Settings.Button.IconPadding+"px)",
                    "backgroundPosition": Settings.Button.IconPadding / 2 + "px",
                    "backgroundColor": Settings.Button.backgroundColor,
                    "backgroundRepeat": "no-repeat"

                },
                buttonInner: {
                    "position": "relative",
                    "width": "100%",
                    "height": "100%",
                },
                menuWrapper: {
                    "display": "none",
                    "position": "absolute",
                    "left": Settings.Button.IconSize + 10 + "px",
                    "padding": Settings.Menu.Padding +"px 0px",
                    "width": Settings.Menu.Width + "px",
                    "borderRadius": "30px",
                    "zIndex": 999,
                    "backgroundColor": Settings.SettingsMenu_BG
                },
                menuInner: {
                    "width": "100%",
                    "height": "100%",
                    "position": "relative"
                }
            }
            const createDiv = create("div");
            let SettingsButton = createDiv("SettingsButtonOuter", "Settings", Stylesheet.buttonOuter)
            let SettingButtonInner = createDiv("SettingButtonInner", "Settings", Stylesheet.buttonInner)
            let SettingsButtonHover = createDiv("SettingsButtonHover", "Settings", {"width": "100%", "height": "100%", "cursor":"pointer", "position":"absolute", "left":"0px", "top":"0px"})
            let SettingsMenu = createDiv("SettingsMenu", "Settings", Stylesheet.menuWrapper)
            let SettingsMenuInner = createDiv("Settings_Inner","Settings", Stylesheet.menuInner)
            let crossHairToggle = CreateSetting("crosshairToggle", "Crosshair: ","","radiobutton")
            let crossHairSize = CreateSetting("crosshairSize", "Crosshair size: ", crosshair.size)
            let crossHairRadius = CreateSetting("crosshairRadius", "Crosshair radius: ", crosshair.radius)


            SettingsMenuInner.appendChild(crossHairToggle);
            SettingsMenuInner.appendChild(crossHairRadius);
            SettingsMenuInner.appendChild(crossHairSize);
            SettingsMenu.appendChild(SettingsMenuInner);
            SettingButtonInner.appendChild(SettingsMenu);
            SettingsButton.appendChild(SettingButtonInner);
            SettingsButton.appendChild(SettingsButtonHover);

            let ServerMenu = document.getElementById("ServerMenu")
            ServerMenu.appendChild(SettingsButton);
            crosshairRadius = document.getElementById("crosshairRadius");
            crosshairSize = document.getElementById("crosshairSize");
            crosshairToggle = document.getElementById("crosshairToggle")
            SettingsMenuElement = document.getElementById("SettingsMenu");
            SettingsButton = document.getElementById("SettingsButtonHover");
            SettingsButtonOuter = document.getElementById("SettingsButtonOuter");

            SettingsButton.addEventListener("click", UpdateSettingsMenu)
            crosshairRadius.addEventListener("input", UpdateCrosshairRadius);
            crosshairSize.addEventListener("input", UpdateCrosshairSize);
        };

        function sanitizeInput(input){
            return input.replace(/[^0-9]/g, "").slice(0,3)
        };

        function toggleButton(enabled)
        {
            if(enabled){
                this.parentElement.style["backgroundColor"] = Settings.RadioButton.ToggleOnColor;
                this.style["right"] = "0px";
                this.style.removeProperty("left");
            } else {
                this.parentElement.style["backgroundColor"] = Settings.RadioButton.ToggleOffColor;
                this.style["left"] = "0px";
                this.style.removeProperty("right");
            }
        }

        function ToggleCrosshair(){
            crosshair.enabled = (crosshair.enabled ? false : true);
            window.localStorage.setItem("crosshair_enabled", crosshair.enabled)
            const object = (
                crosshairToggle.children.length === 0
                ? crosshairToggle
                : crosshairToggle.children[0]
            )
            let toggle = toggleButton.bind(object);
            toggle(crosshair.enabled);
        }

        let setting_open = false;

        function ShowSettingsMenu(toggle){
            SettingsMenuElement.style['display'] = (toggle ? " block" : "none");
            if (toggle)
            {
                SettingsMenuElement.style["top"] = SettingsMenuElement.clientHeight * -1 + Settings.Button.IconSize + "px";
                AnimateOpacity(SettingsMenuElement, 0.2, 16)
            }
        }

        function UpdateSettingsMenu()
        {
                if(setting_open)
                {
                    ShowSettingsMenu(false);
                    document.removeEventListener("click", CloseMenu);
                } else {
                    ShowSettingsMenu(true);
                    document.addEventListener("click", CloseMenu);
                }
                setting_open = setting_open ? false : true;
        }

        function CloseMenu(e)
        {
            if(e.target.id === "crosshairToggle" || e.target.parentElement.id == "crosshairToggle"){
                ToggleCrosshair();
            }
            if(e.target.class !== "Settings")
            {
                setting_open = false;
                SettingsMenuElement.style['display'] = "none";
                document.removeEventListener("click", CloseMenu);
            }

        }
        function UpdateCrosshairSize(e)
        {
            this.value = sanitizeInput(this.value);
            crosshair.size = this.value;
            crosshair.offset = (this.value / 2) + 7;
            CrosshairElement.size(this.value)
            window.localStorage.setItem("crosshair_size", this.value)
        }

        function UpdateCrosshairRadius(e)
        {
            this.value = sanitizeInput(this.value);
            crosshair.radius = this.value
            window.localStorage.setItem("crosshair_radius", this.value)
        }

        // Load settings
        function loadSettings() {
            if (window.localStorage.getItem("nick") != undefined) {
                var nick = window.localStorage.getItem("nick");
                document.getElementById("nick").value = nick;
            }
            if (window.localStorage.getItem("rendermode") != undefined) {
                var mode = parseInt(window.localStorage.getItem("rendermode"));
                if (mode >= 1 && mode <= 3) {
                    renderMode = mode;
                }
            }
        }

        // Get nick
        function getNick() {
            var nick = document.getElementById("nick").value;
            window.localStorage.setItem("nick", nick);
        }
        // Connection status
        function connectionStatus() {
            if (!window.connecting || retry == 10) {
                window.forcing = false;
                retry = 0;
                return;
            }
            retry++;
            setTimeout(connectionStatus, 1000);
        }
        // Force connect
        function forceConnect() {
            if (inpIP.value.length == 0 || !window.connect) {
                return;
            }
            window.forcing = true;
            if (!window.bso) {
                window.bso = {};
            }
            var srv = inpIP.value.trim().split(":");
            window.bso.ip = srv[0];
            window.bso.po = srv[1];
            window.connect();
            setTimeout(connectionStatus, 1000);
        }
        // Get servers list
        function getServersList() {
            if (window.sos && window.sos.length > 0) {
                var selectSrv = document.getElementById("select-srv");
                for (var i = 0; i < sos.length; i++) {
                    var srv = sos[i];
                    var option = document.createElement("option");
                    option.value = srv.ip + ":" + srv.po;
                    option.text = (i + 1) + ". " + option.value;
                    selectSrv.appendChild(option);
                }
                selectSrv.onchange = function() {
                    var srv = selectSrv.value;
                    inpIP.value = srv;
                };
            } else {
                setTimeout(getServersList, 100);
            }
        }
        // Resize view
        function resizeView() {
            if (window.resize) {
                window.lww = 0; // Reset width (force resize)
                window.wsu = 0; // Clear ad space
                window.resize();
                var wh = Math.ceil(window.innerHeight);
                if (wh < 800) {
                    var login = document.getElementById("login");
                    window.lgbsc = wh / 800;
                    login.style.top = - (Math.round(wh * (1 - window.lgbsc) * 1E5) / 1E5) + "px";
                    if (window.trf) {
                        window.trf(login, "scale(" + window.lgbsc + "," + window.lgbsc + ")");
                    }
                }
            } else {
                setTimeout(resizeView, 100);
            }
        }
        // Set leaderboard
        function setLeaderboard() {
            if (window.lbh) {
                window.lbh.textContent = "Mod by SonDerece ♈";
                window.lbh.style.fontSize = "20px";
            } else {
                setTimeout(setLeaderboard, 100);
            }
        }
        // Set normal mode
        function setNormalMode() {
            normalMode = true;
            window.ggbg = true;
            if (!window.bgp2 && bgImage) {
                window.bgp2 = bgImage;
            }
            window.render_mode = 2;
        }
        // Set graphics
        function setGraphics() {
            if (renderMode == 3) {
                if (!normalMode) {
                    setNormalMode();
                }
                return;
            }
            if (normalMode) {
                normalMode = false;
            }
            if (window.want_quality && window.want_quality != 0) {
                window.want_quality = 0;
                window.localStorage.setItem("qual", "0");
                window.grqi.src = "/s/lowquality.png";
            }
            if (window.ggbg && window.gbgmc) {
                window.ggbg = false;
            }
            if (window.bgp2) {
                bgImage = window.bgp2;
                window.bgp2 = undefined;
            }
            if (window.high_quality) {
                window.high_quality = false;
            }
            if (window.gla && window.gla != 0) {
                window.gla = 0;
            }
            if (window.render_mode && window.render_mode != renderMode) {
                window.render_mode = renderMode;
            }
        }

        // Show FPS
        function showFPS() {
            if (window.playing && fpsHUD && window.fps && window.lrd_mtm) {
                if (Date.now() - window.lrd_mtm > 970) {
                    fpsHUD.textContent = "FPS: " + window.fps;
                }
            }
            setTimeout(showFPS, 30);
        }
        // Update loop
        function updateLoop() {
            setGraphics();
            if (window.playing) {
                if (positionHUD) {
                    positionHUD.textContent = "X: " + (~~window.view_xx || 0) + " Y: " + (~~window.view_yy || 0);
                }
                if (inpIP && window.bso && currentIP != window.bso.ip + ":" + window.bso.po) {
                    currentIP = window.bso.ip + ":" + window.bso.po;
                    inpIP.value = currentIP;
                    if (ipHUD) {
                        ipHUD.textContent = "IP: " + currentIP;
                    }
                }
            }
            setTimeout(updateLoop, 1000);
        }
            // Change skin
        function changeSkin() {
            if (window.playing && window.snake != undefined) {
                var skin = window.snake.rcv;
                skin++;
                if (skin > window.max_skin_cv) {
                    skin = 0;
                }
                window.setSkin(window.snake, skin);
            }
        }
        // Rotate skin
        function rotateSkin() {
            if (!rotate) {
                return;
            }
            changeSkin();
            setTimeout(rotateSkin, 1000);
        }
        // Quit to menu
        function quit() {
            if (window.playing) {
                HideCrosshair();
                window.want_close_socket = true;
                window.dead_mtm = 1;
                if (window.ws) {
                    window.ws.close();
                    window.ws = undefined;
                }
                window.playing = window.connected = false;
                window.resetGame();
                window.play_btn.setEnabled(true);
            }
        }
        function GetMousePosition(e)
        {
                window.mouseX = e.clientX;
                window.mouseY = e.clientY;
        }

        function ClearMousePosition()
        {
            window.removeEventListener("mousemove", GetMousePosition);
            clearInterval(mouseLoop);
            mouseLoop = undefined;
        }

        function updateMousePositon (){
                window.addEventListener("mousemove", GetMousePosition);

                let center = [window.innerWidth / 2, window.innerHeight / 2]
                let offset_center = [center[0] - crosshair.offset, center[1] - crosshair.offset]
                

                window.addEventListener("resize", () => {
                    center = [window.innerWidth / 2, window.innerHeight / 2]
                    offset_center = [center[0] - crosshair.offset, center[1] - crosshair.offset]
                })
                let clientX = 0, clientY = 0;
                mouseLoop = setInterval(function()
                    {
                        var dx = window.mouseX - center[0];
                        var dy = window.mouseY - center[1];
                        var scalar = (crosshair.radius * 1.4 * Zoom.Level) / (dx**2 + dy**2)**0.5;

                        clientX = (offset_center[0] + dx * scalar);
                        clientY = (offset_center[1] + dy * scalar);

                        CrosshairElement.style["transform"] = "translate(" + clientX +"px,"+ clientY +"px)";
                    },
                16);
              window.onmousemove = function(b) {
                (window.xm = clientX - window.innerWidth / 2, window.ym = clientY - window.innerHeight / 2)
              };
        }
        init();


        // Init

    })(window);
