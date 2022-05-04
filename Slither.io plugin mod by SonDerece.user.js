// ==UserScript==
// @name         SonDerece Slither.io Mod
// @version      1
// @description  Slither.io Mod
// @author       SonDerece
// @match        http://slither.io/*
// @run-at       document-body
// @grant        none
// ==/UserScript==


(function(w) {
    Object.prototype.SetStyleObject = function(styleObject){
        for (var key in styleObject)
        {
            this.style[key] = styleObject[key];
        }
    };
    var modVersion = "v1.5",
        renderMode = 3, // 3 - normal, 2 - optimized, 1 - simple (mobile)
        normalMode = false,
        gameFPS = null,
        positionHUD = null,
        ipHUD = null,
        fpsHUD = null,
        login = null,
        styleHUD = {
            color: "#FFF",
            fontFamily: "Arial",
            fontSize: "20px",
            position: "fixed",
            opacity: 1,
            zIndex: 7
        }
        inpNick = null,
        currentIP = null,
        retry = 0,
        bgImage = null,

        Crosshair_enabled = false,
        Crosshair_size = 50,
        Crosshair_radius = 150,
        Crosshair_offset = (Crosshair_size / 2) + 7,

        cursorElement = null,
        crosshairSize = null,
        crosshairRadius = null,
        crosshairToggle = null,

        mouseLoop = null,
        
        SettingsButton = null,
        SettingsButtonOuter = null,
        SettingsMenuElement = null,
        Center = [ (window.innerWidth / 2), (window.innerHeight / 2)],
        offsetCenter = [ Center[0] - Crosshair_offset, Center[1] - Crosshair_offset];
    
    function GetGlobalsFromStorage()
    {
       const size = w.localStorage.getItem("Crosshair_size");
       const radius = w.localStorage.getItem("Crosshair_radius");
       const enabled = JSON.parse(w.localStorage.getItem("Crosshair_enabled"));
       if(size !== null){
        Crosshair_size = size;
       }
       if(radius !== null)
       {
        Crosshair_radius = radius;
       }
       if(enabled !== null)
       {
        Crosshair_enabled = enabled
       }
    }
    
    
    GetGlobalsFromStorage();

    function init() {
        // Append DIVs
        appendDiv("position-hud", "nsi", {...styleHUD, right: "30", bottom: "120px"});
        appendDiv("ip-hud", "nsi", {...styleHUD, right: "30", top:"220px"});
        appendDiv("fps-hud", "nsi", {...styleHUD, right: "30", top: "250px"});
        appendDiv(
            "cursorElement",
            "nsi",
            {
                width: Crosshair_size + "px",
                height: Crosshair_size + "px",
                display: "none",
                pointerEvents: "none",
                zIndex: 999,
                position: "absolute",
                transform: "translate(" +Center[0]+ "px,"+Center[1]+ "px)"
            },
            "img"
        )

        cursorElement = document.getElementById("cursorElement");
        positionHUD = document.getElementById("position-hud");
        ipHUD = document.getElementById("ip-hud");
        fpsHUD = document.getElementById("fps-hud");
        // Add zoom
        if (/firefox/i.test(navigator.userAgent)) {
            document.addEventListener("DOMMouseScroll", zoom, false);
        } else {
            document.body.onmousewheel = zoom;
        }
        // Keys
        w.addEventListener("keydown", function(e) {
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
            return
    }
    function showCursor()
    {
        if(Crosshair_enabled)
        {
            cursorElement.style.display = "block"

            return
        }

        cursorElement.style.display = "none";
        return
    }
    function hideCursor()
    {
        if(Crosshair_enabled)
        {
            cursorElement.style.display = "none";
        }
    }
    startShowGame = () => {
        //internal code;
        llgmtm = Date.now();
        login_iv = setInterval(loginFade, 25);
        mc.style.opacity = 0;
        mc.style.display = "inline";
        lbh.style.opacity = lbs.style.opacity = lbn.style.opacity = lbp.style.opacity = lbf.style.opacity = vcm.style.opacity = 0;
        loch.style.opacity = 0;
        lb_fr = -1

        //functions
        showCursor();
        OnGameOver();
    }

    function OnGameOver(){
        let timer = setInterval(() => {
            if (window.dead_mtm > -1){
                hideCursor();
                clearInterval(timer)
            }
        }, 2400)
    }

    // Append DIV
    function appendDiv(id, className, styleObject, elementType = "div", tags) {
        var div = document.createElement(elementType);
        if(elementType === "img"){
            div.setAttribute("src", "https://i.imgur.com/R7JMiL1.png")
        }
        if (id) {
            div.id = id;
        }
        if (className) {
            div.className = className;
        }
        if (styleObject) {
            div.SetStyleObject(styleObject);
        }

        document.body.appendChild(div);
    }

    // Zoom
    const Zoom = {
        Level: 0.9,
        Reset: true,
        Default: 0.9
    }
    function zoom(e) {
        if (!w.gsc) {
            return;
        }
        w.gsc *= Math.pow(0.9, e.wheelDelta / -120 || e.detail / 2 || 0);
        Zoom.Level = w.gsc;
        Zoom.Reset = false;

    }
    	// Reset zoom
    function resetZoom() {
        if(Zoom.Reset){
           w.gsc = Zoom.Level;
           Zoom.Reset = false;
           return
        }
        w.gsc = Zoom.Default;
        Zoom.Reset = true;
    }
    // Get console log
    function getConsoleLog(log) {
        //w.console.logOld(log);
        if (log.indexOf("FPS") != -1) {
            gameFPS = log;
        }
    }
    // Set menu
    function setMenu() {
        login = document.getElementById("login");
        if (login) {
            // Load settings
            loadSettings();
            // Message
            var div = document.createElement("div");
                div.SetStyleObject({
                    width: "300px",
                    color: "#FFF",
                    fontFamily: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
                    fontSize: "14px",
                    textAlign: "center",
                    opacity: "0.5",
                    margin: "0 auto",
                    padding: "10px 0"
                })
                div.innerHTML += '<a target="_blank" style="color: #56ac81; opacity: 2;">| Q <strong>→</strong> Back to main menu |<br/> | ESC <strong>→</strong> Quick Restart |<br/>| Z <strong>→</strong> Reset Zoom |<br/> | S <strong>→</strong> Change Skin |</a>';
            login.appendChild(div);
            // Menu container
            var sltMenu = document.createElement("div");
                sltMenu.id = "ServerMenu";
                sltMenu.SetStyleObject({
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
                })
                sltMenu.innerHTML = "Slither.io Mod";
            login.appendChild(sltMenu);
            // IP input container
            var div = document.createElement("div");
                div.SetStyleObject({
                    color:"#8058D0",
                    backgroundColor:"#919191",
                    borderRadius:"29px",
                    margin:"10 auto",
                    padding:"8px"
                })
            sltMenu.appendChild(div);
            // IP input
            var input = document.createElement("input");
                input.id = "server-ip";
                input.type = "text";
                input.placeholder = "Server Address";
                input.SetStyleObject({
                    height:"24px",
                    display:"inline-block",
                    background:"none",
                    border:"none",
                    outline:"none",
                    textAlign:"center"
                })
            div.appendChild(input);
            // Connect (play) button
            var button = document.createElement("input");
                button.id = "connect-btn";
                button.type = "button";
                button.value = "Play";
                button.SetStyleObject({
                    height:"24px",
                    display:"inline-block",
                    borderRadius:"12px",
                    color:"#FFF",
                    backgroundColor:"#56ac81",
                    border:"none",
                    outline:"none",
                    cursor:"pointer",
                    padding:"0 20px"
                })
            div.appendChild(button);
            // Select server container
            var div = document.createElement("div");
                div.SetStyleObject({
                    backgroundColor:"#919191",
                    borderRadius:"29px",
                    margin:"10 auto",
                    padding:"8px"
                })
            sltMenu.appendChild(div);
            // Select server
            var select = document.createElement("select");
                select.id = "select-srv";
                select.SetStyleObject({
                    background:"none",
                    border:"none",
                    outline:"none"
                })
            var option = document.createElement("option");
                option.value = "";
                option.text = "★ Server Selection ★";
            select.appendChild(option);
            div.appendChild(select);
            // Select graph container
            var div = document.createElement("div");
                div.SetStyleObject({
                    backgroundColor:"#A5A5A5",
                    borderRadius:"29px",
                    margin:"10 auto",
                    padding:"8px"
                })
            sltMenu.appendChild(div);
            // Select graph
            var select = document.createElement("select");
                select.id = "select-graph";
                    select.SetStyleObject({
                        background:"none",
                        border:"none",
                        outline:"none"
                    })
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
            // Get IP input
            inpIP = document.getElementById("server-ip");
            // Get nick
            var nick = document.getElementById("nick");
            nick.addEventListener("input", getNick, false);
            // Force connect
            var connectBtn = document.getElementById("connect-btn");
            connectBtn.onclick = forceConnect;
            // Get servers list
            getServersList();
            // Set graphic mode
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
                Width: 85,
                BorderSize: 100,
                Margin: 12,
                HeaderWidth: null,
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
                HeaderWidth: null,
                Width: 30,
                FontSize: 13,
            },

            SettingsMenu_BG: "#1E262E"
    };
    Settings.Input.HeaderWidth = (Settings.Menu.Width * (Settings.Setting.Width * 0.01));

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
            }
        };
        if(Crosshair_enabled)
        {
            Stylesheets.RadioButton["right"] = "0px"
        }
        else 
        {
            Stylesheets.RadioButton["left"] = "0px"
        }
        let Setting_Outer = document.createElement("div");
            Setting_Outer.SetStyleObject(Stylesheets.SettingOuter);
            Setting_Outer.class = "Settings";

        let SettingInner_TextWrapper = document.createElement("div");
            SettingInner_TextWrapper.SetStyleObject(Stylesheets.SettingInner_TextWrapper);
            SettingInner_TextWrapper.class = "Settings";

        let SettingInner_Text = document.createElement("p");
            SettingInner_Text.SetStyleObject(Stylesheets.SettingInner_Text);
            SettingInner_Text.textContent = DefaultText;
            SettingInner_Text.class = "Settings";

        let SettingInner_InputWrapper = document.createElement("div")
            SettingInner_InputWrapper.SetStyleObject(Stylesheets.SettingInner_InputWrapper);
            SettingInner_InputWrapper.setAttribute("inputType", SettingType)
            SettingInner_InputWrapper.class = "Settings";


        let SettingInner_Input = null;

        if(SettingType === "input")
        {
            SettingInner_Input = document.createElement("input");
            SettingInner_Input.setAttribute("inputType", SettingType)
            SettingInner_Input.value = DefaultInputText;
            SettingInner_Input.class = "Settings";
            SettingInner_Input.SetStyleObject(Stylesheets.SettingInner_Input);
            SettingInner_Input.id = InputId;
        }
        else if (SettingType === "radiobutton")
        {
            RadioButtonWrapper = document.createElement("div");
            RadioButtonWrapper.class = "Settings";
            RadioButtonWrapper.id = InputId;
            RadioButtonWrapper.SetStyleObject({
                "width": "100%",
                "height" : "100%",
                "margin": "0px",
                "padding": "0x",
                "position": "relative",
                "cursor":"pointer",
                "backgroundColor": (Crosshair_enabled ? Settings.RadioButton.ToggleOnColor : Settings.RadioButton.ToggleOffColor)
            })

            RadioButton = document.createElement("div")
            RadioButton.class = "Settings";
            RadioButton.setAttribute("inputType", SettingType)
            RadioButton.setAttribute("toggle", true);

            RadioButton.SetStyleObject(Stylesheets.RadioButton)
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

        let SettingsButton = document.createElement("div");
            SettingsButton.SetStyleObject(Stylesheet.buttonOuter);
            SettingsButton.id = "SettingsButtonOuter";
            SettingsButton.class = "Settings"

        let SettingButtonInner = document.createElement("div");
            SettingButtonInner.SetStyleObject(Stylesheet.buttonInner);
            SettingButtonInner.id = "SettingButtonInner";
            SettingButtonInner.class = "Settings"
        let SettingsButtonHover = document.createElement("div");
            SettingsButtonHover.id = "SettingsButtonHover"
            SettingsButtonHover.class = "Settings";
            SettingsButtonHover.SetStyleObject({"width": "100%", "height": "100%", "cursor":"pointer", "position":"absolute", "left":"0px", "top":"0px"})
        let SettingsMenu = document.createElement("div");
            SettingsMenu.SetStyleObject(Stylesheet.menuWrapper);
            SettingsMenu.id = "SettingsMenu";
            SettingsMenu.class = "Settings"
        let SettingsMenuInner = document.createElement("div");
            SettingsMenuInner.SetStyleObject(Stylesheet.menuInner);
            SettingsMenuInner.class = "Settings"

        let crossHairToggle = CreateSetting("crosshairToggle", "Crosshair: ","","radiobutton")
        let crossHairSize = CreateSetting("crosshairSize", "Crosshair size: ", Crosshair_size)
        let crossHairRadius = CreateSetting("crosshairRadius", "Crosshair radius: ", Crosshair_radius)


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

    function toggleButton(object, enabled)
    {
        if(enabled){
            object.parentElement.style["backgroundColor"] = Settings.RadioButton.ToggleOnColor;
            object.style["right"] = "0px"
            object.style.removeProperty("left");
            return;
        }
        object.parentElement.style["backgroundColor"] = Settings.RadioButton.ToggleOffColor;
        object.style["left"] = "0px"
        object.style.removeProperty("right");
        return
    }

    function ToggleCrosshair(e){
        let target = (e.target.children.length === 0 ? e.target : e.target.children[0] );
        if(Crosshair_enabled)
        {
            Crosshair_enabled = false;
            w.localStorage.setItem("Crosshair_enabled", false)
            toggleButton(target, false)

            ClearMousePosition();
            return;
        }
        Crosshair_enabled = true;
        toggleButton(target, true)
        w.localStorage.setItem("Crosshair_enabled", true)
        updateMousePositon();
        return;
    }


    function UpdateSettingsMenu(e)
    {
            const DisplayStyle = SettingsMenuElement.style.getPropertyValue('display');
            if(DisplayStyle === 'block')
            {
                document.removeEventListener("click", CloseMenu);
                crosshairToggle.removeEventListener("click", ToggleCrosshair)
                SettingsMenuElement.style['display'] = "none";
                return;
            }
            SettingsMenuElement.style['display'] = "block";
            AnimateOpacity(SettingsMenuElement, 0.2, 16)
            console.log(SettingsMenuElement.style['display'])
            SettingsMenuElement.style["top"] = SettingsMenuElement.clientHeight * -1
                                                + Settings.Button.IconSize + "px";

            crosshairToggle.addEventListener("click", ToggleCrosshair)
            document.addEventListener("click", CloseMenu);
            return;
    }
    function CloseMenu(e)
    {
        if(e.target.class !== "Settings")
        {
            crosshairToggle.removeEventListener("click", ToggleCrosshair)
            document.removeEventListener("click", CloseMenu);
            SettingsMenuElement.style['display'] = "none";
        }
    }

    function UpdateCrosshairSize(e)
    {
        
        const InputSize = sanitizeInput(e.target.value);
        e.target.value = InputSize;

        Crosshair_size = InputSize;
        Crosshair_offset = (InputSize / 2) + 7;

        offsetCenter[0] = Center[0] - Crosshair_offset;
        offsetCenter[1] = Center[1] - Crosshair_offset;

        cursorElement.style["width"] = InputSize + "px";
        cursorElement.style["height"] = InputSize + "px";

        w.localStorage.setItem("Crosshair_size", InputSize)
    }

    function UpdateCrosshairRadius(e)
    {
        e.target.value = sanitizeInput(e.target.value);
        Crosshair_radius = e.target.value

        w.localStorage.setItem("Crosshair_radius", e.target.value)
    }

    // Load settings
    function loadSettings() {
        if (w.localStorage.getItem("nick") != null) {
            var nick = w.localStorage.getItem("nick");
            document.getElementById("nick").value = nick;
        }
        if (w.localStorage.getItem("rendermode") != null) {
            var mode = parseInt(w.localStorage.getItem("rendermode"));
            if (mode >= 1 && mode <= 3) {
                renderMode = mode;
            }
        }
    }
    // Get nick
    function getNick() {
        var nick = document.getElementById("nick").value;
        w.localStorage.setItem("nick", nick);
    }
    // Connection status
    function connectionStatus() {
        if (!w.connecting || retry == 10) {
            w.forcing = false;
            retry = 0;
            return;
        }
        retry++;
        setTimeout(connectionStatus, 1000);
    }
    // Force connect
    function forceConnect() {
        if (inpIP.value.length == 0 || !w.connect) {
            return;
        }
        w.forcing = true;
        if (!w.bso) {
            w.bso = {};
        }
        var srv = inpIP.value.trim().split(":");
        w.bso.ip = srv[0];
        w.bso.po = srv[1];
        w.connect();
        setTimeout(connectionStatus, 1000);
    }
    // Get servers list
    function getServersList() {
        if (w.sos && w.sos.length > 0) {
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
        if (w.resize) {
            w.lww = 0; // Reset width (force resize)
            w.wsu = 0; // Clear ad space
            w.resize();
            var wh = Math.ceil(w.innerHeight);
            if (wh < 800) {
                var login = document.getElementById("login");
                w.lgbsc = wh / 800;
                login.style.top = - (Math.round(wh * (1 - w.lgbsc) * 1E5) / 1E5) + "px";
                if (w.trf) {
                    w.trf(login, "scale(" + w.lgbsc + "," + w.lgbsc + ")");
                }
            }
        } else {
            setTimeout(resizeView, 100);
        }
    }
    // Set leaderboard
    function setLeaderboard() {
        if (w.lbh) {
            w.lbh.textContent = "Mod by SonDerece ♈";
            w.lbh.style.fontSize = "20px";
        } else {
            setTimeout(setLeaderboard, 100);
        }
    }
    // Set normal mode
    function setNormalMode() {
        normalMode = true;
        w.ggbg = true;
        if (!w.bgp2 && bgImage) {
            w.bgp2 = bgImage;
        }
        w.render_mode = 2;
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
        if (w.want_quality && w.want_quality != 0) {
            w.want_quality = 0;
            w.localStorage.setItem("qual", "0");
            w.grqi.src = "/s/lowquality.png";
        }
        if (w.ggbg && w.gbgmc) {
            w.ggbg = false;
        }
        if (w.bgp2) {
            bgImage = w.bgp2;
            w.bgp2 = null;
        }
        if (w.high_quality) {
            w.high_quality = false;
        }
        if (w.gla && w.gla != 0) {
            w.gla = 0;
        }
        if (w.render_mode && w.render_mode != renderMode) {
            w.render_mode = renderMode;
        }
    }

    // Show FPS
    function showFPS() {
        if (w.playing && fpsHUD && w.fps && w.lrd_mtm) {
            if (Date.now() - w.lrd_mtm > 970) {
                fpsHUD.textContent = "FPS: " + w.fps;
            }
        }
        setTimeout(showFPS, 30);
    }
    // Update loop
    function updateLoop() {
        setGraphics();
        if (w.playing) {
            if (positionHUD) {
                positionHUD.textContent = "X: " + (~~w.view_xx || 0) + " Y: " + (~~w.view_yy || 0);
            }
            if (inpIP && w.bso && currentIP != w.bso.ip + ":" + w.bso.po) {
                currentIP = w.bso.ip + ":" + w.bso.po;
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
		if (w.playing && w.snake != null) {
			var skin = w.snake.rcv;
			skin++;
			if (skin > w.max_skin_cv) {
				skin = 0;
			}
			w.setSkin(w.snake, skin);
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
        if (w.playing) {
            SettingsMenuElement.style['display'] = "none";
            console.log("hello world!")
            w.want_close_socket = true;
            w.dead_mtm = 1;
			if (w.ws) {
				w.ws.close();
				w.ws = null;
			}
            w.playing = w.connected = false;
            w.resetGame();
            w.play_btn.setEnabled(true);
        }
    }
    function GetDocumentCenter()
    {
        Center[0] = (window.innerWidth / 2);
        Center[1] = (window.innerHeight / 2);
        offsetCenter[0] = Center[0] - Crosshair_offset;
        offsetCenter[1] = Center[1] - Crosshair_offset;
    }
    function GetMousePosition(e)
    {
            window.mouseX = e.clientX;
            window.mouseY = e.clientY;
    }

    init();

    function ClearMousePosition()
    {
        clearInterval(mouseLoop);
        mouseLoop = null;
    }
    function updateMousePositon (){
        if(Crosshair_enabled)
        {
            console.log("inside loop wtf:", Crosshair_enabled)
            mouseLoop = setInterval(function()
                {
                    var dx = window.mouseX - Center[0];
                    var dy = window.mouseY - Center[1];
                    var scalar = Crosshair_radius / (dx**2 + dy**2)**0.5;
                    cursorElement.style["transform"] = "translate(" + (offsetCenter[0] + dx * scalar)+"px,"+ (offsetCenter[1] + dy * scalar)+"px)";
                },
            17);
        }
    }
    window.onload = updateMousePositon();
    window.addEventListener("mousemove", GetMousePosition);
    window.addEventListener("resize", GetDocumentCenter);
    // Init

})(window);
