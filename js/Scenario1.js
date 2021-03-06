/*
Waiting at the bus stop. 
Task: Select which bus was taken
*/
var TCDEMO = TCDEMO || {};
TCDEMO.SCENARIO1 = {
    finishedEvent: 'scenario1::finished'
};

function Scenario1() {
    var $scenario;
    var activeTimeouts = [];
    var parallaxScenario1;
    var audioCtrl = new AudioController();
    var eventsCtrl = new EventsController();
    var menuCtrl = new MenuController();
    var badgeMenuCtrl = new BadgeMenuController();

    var scenarioInfo = {
        selectorId: 'scenario1',
        surroundings: {
            audioSrc: 'assets/audios/scenario1/surroundings.mp3',
            length: 6000
        },
        onArrival: {
            audioSrc: 'assets/audios/scenario1/onArrival.mp3',
            length: 7000
        }
    };

    function clearActiveTimeouts() {
        for (var i = 0; i < activeTimeouts.length; i++) {
            clearTimeout(activeTimeouts[i]);
        }
    };

    // single tap to activate badge (select 1st item) or
    // to exit badge if already active
    function onSingleTap() {
        if (badgeMenuCtrl.isActive()) {
            badgeMenuCtrl.deactivate();
        } else {
            badgeMenuCtrl.activate();
        }
    };

    // Show menu on double tap 
    function onDoubleTap() {
        if (!menuCtrl.isOpen()) {
            menuCtrl.open();
        } else {
            menuCtrl.close();
        }
    };

    // Pause audio
    function onTwoFingerTap() {
        audioCtrl.toggle();
    }

    // Swipe down to select 2nd item        
    // Swipe up to select 1st item again
    function onSwipe(event) {
        if (event.additionalEvent === TCDEMO.EVENTS.swipeDown) {
            badgeMenuCtrl.activateSecond();
        } else if (event.additionalEvent === TCDEMO.EVENTS.swipeUp) {
            badgeMenuCtrl.activateFirst();
        }
    };

    // If badgeMenu is active, Hold will select active item
    // If badgeMenu is NOT active, Hold will describe surroundings
    function onPress() {
        if (badgeMenuCtrl.isActive()) {
            var activeItem = badgeMenuCtrl.getActive();
            audioCtrl.play(activeItem.audio.onSelected.audioSrc, false);

            activeTimeouts.push(setTimeout(endScenario, activeItem.audio.onSelected.length + 2000));
        } else {
            audioCtrl.play(scenarioInfo.surroundings.audioSrc, false);
        }
    };

    function setupEventHandlers() {
        eventsCtrl.setupHandler(TCDEMO.EVENTS.swipe, (ev) => onSwipe(ev));
        eventsCtrl.setupHandler(TCDEMO.EVENTS.press, onPress);
        eventsCtrl.setupHandler(TCDEMO.EVENTS.twoFingerTap, onTwoFingerTap);

        eventsCtrl.setupDoubleClick(onDoubleTap, onSingleTap);
    };

    function destroyEventHandlers() {
        eventsCtrl.removeHandler(TCDEMO.EVENTS.swipe, (ev) => onSwipe(ev));
        eventsCtrl.removeHandler(TCDEMO.EVENTS.press, onPress);
        eventsCtrl.removeHandler(TCDEMO.EVENTS.twoFingerTap, onTwoFingerTap);
    };

    function startScenario() {
        $scenario = $('#' + scenarioInfo.selectorId);
        $scenario.removeClass('hide');

        eventsCtrl.setupScenario(scenarioInfo.selectorId);
        eventsCtrl.setupAllEvents();
        setupEventHandlers();

        // set up parallax
        parallaxScenario1 = new Parallax($scenario[0], {
            relativeInput: true,
            pointerEvents: true
        });

        badgeMenuCtrl.show();

        // audio cues
        audioCtrl.play(scenarioInfo.onArrival.audioSrc, false);
    };

    function endScenario() {
        badgeMenuCtrl.hide();

        audioCtrl.stop();

        clearActiveTimeouts();
        destroyEventHandlers();
        eventsCtrl.stopScenario();

        parallaxScenario1.disable();
        parallaxScenario1.destroy();

        $scenario.addClass('hide');
        $scenario = null;

        $.event.trigger({
            type: TCDEMO.SCENARIO1.finishedEvent
        });
    }

    return {
        start: startScenario,
        stop: endScenario
    }
};