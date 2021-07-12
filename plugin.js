import confirmdialog from './components/confirmdialog.vue';
import nsdialog from './components/nsdialog.vue';
import nslogindialog from './components/nslogindialog.vue';
import nsregisterdialog from './components/nsregisterdialog.vue';

import './style.css'

kiwi.plugin('nickserv', function(kiwi) {

    // Plugin Config #########################################################################

    // Wrong password text
    var WPText = "Wrong password!";
    // Bad password text on register
    var BPText = "Warning, try again with a more secure password.<br> Passwords must be at least 5 characters long, they must not be easily understood (eg your name or nick)<br> and they cannot contain space characters and tab.";

    // ANOPE NICKSERV
    // NickServ Identify Regex   include/language.h:92
    var IDString = "^This nickname is registered and protected.  If it is your";
    // Wrong password Regex include/language.h:71
    var WPString = "^Password incorrect.";
    // Services enforce nick Regex  modules/pseudoclients/nickserv.cpp:254
    var ENString = "^Your nickname is now being changed to";
    // Account confirmation request Regex  modules/commands/ns_register.cpp:260 modules/commands/ns_register.cpp:391
    // var ConfirmReqString = "^Your email has not been confirmed. To confirm it, follow the instructions contained in the email you received when you registered";
    var ConfirmReqString = "^Your email address is not confirmed. To confirm it, follow the instructions that were emailed to you.";
    // Invalid Confirmation code Regex modules/commands/ns_register.cpp:83 modules/commands/ns_register.cpp:86
    var InvalidConfirmString = "^Invalid passcode.";
    // Invalid Confirmation code text include/language.h:99
    var InvalidConfirmText = "Invalid passcode has been entered, please check the e-mail again, and retry.";
    // A valid confirmation code has been entered modules/commands/ns_register.cpp:67
    var ValidConfirmString = "^Your email address of .+@.+\..+ has been confirmed.";
    // Bad Password Notify include/language.h:73
    var BadPwdString = "^Please try again with a more obscure password.";
    // Bad Email Notify include/language.h:86
    var BadEmailString = "it is not a valid email address.";
    // Register delay modules/commands/ns_register.cpp:153
    var RegDelayString = "^You must have been using this nick for at least [0-9]+ seconds to register.";
    // Login success Valid Password Regex modules/commands/ns_identify.cpp:38
    var ValidPwdString = "^Password accepted - you are now recognized.";
    // Already identified modules/commands/ns_identify.cpp:87 modules/commands/os_login.cpp:34
    var AlreadyIdString ="^You are already identified.";
    // End Plugin Config  ####################################################################

    var IDRe = new RegExp(IDString ,"");
    var WPRe = new RegExp(WPString ,"");
    var ENRe = new RegExp(ENString ,"");
    var ConfirmReqRe = new RegExp(ConfirmReqString ,"");
    var InvalidConfirmRe = new RegExp(InvalidConfirmString ,"");
    var ValidConfirmRe = new RegExp(ValidConfirmString ,"");
    var BadPwdRe = new RegExp(BadPwdString ,"");
    var BadEmailRe = new RegExp(BadEmailString ,"");
    var RegDelayRe = new RegExp(RegDelayString ,"");
    var ValidPwdRe = new RegExp(ValidPwdString ,"");
    var AlreadyIdRe = new RegExp(AlreadyIdString ,"");

    var data = new kiwi.Vue({data: {themeName: ''}});
    data.themeName = kiwi.themes.currentTheme().name.toLowerCase();

    kiwi.on('theme.change', function(event) {
        data.themeName = kiwi.themes.currentTheme().name.toLowerCase();
        //console.log(data.themeName);

    });

    function registerFn() {
         kiwi.state.$emit('mediaviewer.show', {component: nsregisterdialog });
         kiwi.emit('statebrowser.hide')
    }

    function logoutFn() {
         kiwi.state.$emit('input.raw', '/NS Logout' );
    }

    function loginFn() {
         kiwi.state.$emit('mediaviewer.show', {component: nslogindialog });
         kiwi.emit('statebrowser.hide')
    }


    var loginBtn = document.createElement('a');
    loginBtn.innerHTML = '<i aria-hidden="true" class="fa fa-sign-in"></i><span>&nbsp;Login</span>';
    /*loginBtn.innerHTML = '<i aria-hidden="true" class="fa fa-sign-in"></i><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto"><span>&nbsp;Login</span>';*/
    loginBtn.className = 'kiwi-statebrowser-login';
    loginBtn.style.cssText = "border: 2px solid #1B9AAA; border-radius: 7px; cursor: pointer; background-color: #D4C5E2; color: #001021; padding: 5px;font-family: Roboto;";
    loginBtn.addEventListener("click", loginFn);
    kiwi.addUi('browser', loginBtn);
    
    var RegBtn = document.createElement('a');
    RegBtn.className = 'kiwi-statebrowser-register';
    RegBtn.style.cssText = "border: 2px solid #1B9AAA; border-radius: 7px; cursor: pointer; background-color: #D4C5E2; color: #001021; padding: 5px;font-family: Roboto;";
    RegBtn.addEventListener("click", registerFn );
    RegBtn.innerHTML = '<i aria-hidden="true" class="fa fa-lock"></i><span>&nbsp;Register</span>';
    /*RegBtn.innerHTML = '<i aria-hidden="true" class="fa fa-lock"></i><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto"><span>&nbsp;Register</span>';*/
    kiwi.addUi('browser', RegBtn);
    
    kiwi.on('irc.mode', function(event, network) {
        //console.log(event);
        if ((event.nick == "NickServ") && (event.target == network.nick)) {
            setTimeout(function() {
                var net = kiwi.state.getActiveNetwork();
                //console.log(net.ircClient.user.modes.has('r'));
                var hasR = net.ircClient.user.modes.has('r');

                if (hasR == true) {
                        loginBtn.innerHTML = '<i aria-hidden="true" class="fa fa-sign-out"></i><span>Logout</span>';
                        loginBtn.removeEventListener("click", loginFn);
                        loginBtn.addEventListener("click", logoutFn);
                        RegBtn.removeEventListener("click", registerFn );
                        RegBtn.style.visibility="hidden";
                        loginBtn.className = 'kiwi-statebrowser-logout';
                    } else {
                        loginBtn.innerHTML = '<i aria-hidden="true" class="fa fa-sign-in"></i><span>Login</span>';
                        loginBtn.className = 'kiwi-statebrowser-login';
                        loginBtn.removeEventListener("click", logoutFn);
                        loginBtn.addEventListener("click", loginFn);
                        RegBtn.style.visibility="visible";
                        RegBtn.addEventListener("click", registerFn );
                    }

                }, 0);
        }

    });

    kiwi.on('irc.notice', function(event) {

        if ((event.nick == 'NickServ') && (event.message.match(IDRe))) {
                kiwi.state.$emit('mediaviewer.show', {component: nsdialog })
            }
        if ((event.nick == 'NickServ') && (event.message.match(WPRe))) {
                var el = document.getElementById("validate")
                el.innerHTML = WPText ;
            }
        if ((event.nick == 'NickServ') && (event.message.match(ConfirmReqRe))) {
                kiwi.state.$emit('mediaviewer.show', {component: confirmdialog })
            }

        if ((event.nick == 'NickServ') && (event.message.match(InvalidConfirmRe))) {
                var el = document.getElementById("validate")
                el.innerHTML = InvalidConfirmText ;
            }

        if ((event.nick == 'NickServ') && (event.message.match(ENRe))) {
                kiwi.state.$emit('mediaviewer.hide')
            }

        if ((event.nick == 'NickServ') && (event.message.match(ValidConfirmRe))) {
                //kiwi.state.$emit('mediaviewer.hide')
                var el = document.getElementById("validate");
                el.innerHTML = "<div style=\"background-color:green;color:white;display:inline\"><b> Success!! Your name is now registered.&nbsp;</b></div>" ;
                setTimeout(function() {
                    kiwi.state.$emit('mediaviewer.hide');
                }, 4000);
            }

        if ((event.nick == 'NickServ') && (event.message.match(BadPwdRe))) {
                var el = document.getElementById("validate")
                el.innerHTML = BPText ;
            }

        if ((event.nick == 'NickServ') && (event.message.match(BadEmailRe))) {
                var el = document.getElementById("validate")
                el.innerHTML = event.message ;
            }

        if ((event.nick == 'NickServ') && (event.message.match(RegDelayRe))) {
                var el = document.getElementById("validate");
                //el.innerHTML = event.message ;
                el.innerHTML = "<div style=\"background-color:red;color:white;display:inline\"> Wait 60 seconds.&nbsp;</div>" ;
                //setTimeout(function(){ alert("Hello"); }, 1);
                setTimeout(function() {
                    kiwi.state.$emit('mediaviewer.hide');
                }, 10000);
            }
        if ((event.nick == 'NickServ') && (event.message.match(ValidPwdRe))) {
                var el = document.getElementById("validate");
                el.innerHTML = event.message ;
                //console.log('ValidPwdRe');
                setTimeout(function() {
                    kiwi.state.$emit('mediaviewer.hide');
                }, 2000);
            }

        if ((event.nick == 'NickServ') && (event.message.match(AlreadyIdRe))) {
                var el = document.getElementById("validate");
                el.innerHTML = event.message ;
                setTimeout(function() {
                    kiwi.state.$emit('mediaviewer.hide');
                }, 2000);
            }
         });

    kiwi.on('input.command.nick', function(event) {
        kiwi.state.$emit('mediaviewer.hide')
    });

});
