/****************************************************************************
**
** Copyright (C) 2016 The Qt Company Ltd.
** Contact: https://www.qt.io/licensing/
**
** This file is part of the QtCanvas3D module of the Qt Toolkit.
**
** $QT_BEGIN_LICENSE:BSD$
** Commercial License Usage
** Licensees holding valid commercial Qt licenses may use this file in
** accordance with the commercial license agreement provided with the
** Software or, alternatively, in accordance with the terms contained in
** a written agreement between you and The Qt Company. For licensing terms
** and conditions see https://www.qt.io/terms-conditions. For further
** information use the contact form at https://www.qt.io/contact-us.
**
** BSD License Usage
** Alternatively, you may use this file under the terms of the BSD license
** as follows:
**
** "Redistribution and use in source and binary forms, with or without
** modification, are permitted provided that the following conditions are
** met:
**   * Redistributions of source code must retain the above copyright
**     notice, this list of conditions and the following disclaimer.
**   * Redistributions in binary form must reproduce the above copyright
**     notice, this list of conditions and the following disclaimer in
**     the documentation and/or other materials provided with the
**     distribution.
**   * Neither the name of The Qt Company Ltd nor the names of its
**     contributors may be used to endorse or promote products derived
**     from this software without specific prior written permission.
**
**
** THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
** "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
** LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
** A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
** OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
** LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
** DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
** THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
** (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
** OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."
**
** $QT_END_LICENSE$
**
****************************************************************************/

import QtQuick 2.0
import QtCanvas3D 1.0

import "planets.js" as GLCode

Item {
    id: mainview
    width: 1280
    height: 768
    visible: true
    property int focusedPlanet: 100
    property int oldPlanet: 0
    property real xLookAtOffset: 0
    property real yLookAtOffset: 0
    property real zLookAtOffset: 0
    property real xCameraOffset: 0
    property real yCameraOffset: 0
    property real zCameraOffset: 0
    property real cameraNear: 0
    property int sliderLength: (width < height) ? width / 2 : height / 2
    property real textSize: (sliderLength < 320) ? (sliderLength / 20) : 16
    property real planetButtonSize: (height < 768) ? (height / 11) : 70

    NumberAnimation {
        id: lookAtOffsetAnimation
        target: mainview
        properties: "xLookAtOffset, yLookAtOffset, zLookAtOffset"
        to: 0
        easing.type: Easing.InOutQuintca
        duration: 1250
    }

    NumberAnimation {
        id: cameraOffsetAnimation
        target: mainview
        properties: "xCameraOffset, yCameraOffset, zCameraOffset"
        to: 0
        easing.type: Easing.InOutQuint
        duration: 2500
    }

    Behavior on cameraNear {
        PropertyAnimation {
            easing.type: Easing.InOutQuint
            duration: 2500
        }
    }
    //! [1]
    onFocusedPlanetChanged: {
        /*if (focusedPlanet == 100) {
            info.opacity = 0;
            updatePlanetInfo();
        } else {
            updatePlanetInfo();
            info.opacity = 0;
        }
*/
        GLCode.prepareFocusedPlanetAnimation();

        lookAtOffsetAnimation.restart();
        cameraOffsetAnimation.restart();
    }
    //! [1]
    //! [0]
    Canvas3D {
        id: canvas3d
        anchors.fill: parent
        //! [4]
        onInitializeGL: {
            GLCode.initializeGL(canvas3d, eventSource, mainview);
        }
        //! [4]
        onPaintGL: {
            GLCode.paintGL(canvas3d);
            fpsDisplay.fps = canvas3d.fps;
        }

        onResizeGL: {
            GLCode.onResizeGL(canvas3d);
        }
        //! [3]
        ControlEventSource {
            anchors.fill: parent
            focus: true
            id: eventSource
        }
        //! [3]
    }
    //! [0]
    ListModel {
        id: planetModel

        ListElement {
            name: "Sun"
            planetImageSource: "images/sun.png"
            planetNumber: 0
        }

        ListElement {
            name: "Earth"
            planetImageSource: "images/earth.png"
            planetNumber: 1
        }
        ListElement {
            name: ""
            planetImageSource: "images/mars.png"
            planetNumber: 2
        }

        ListElement {
            name: ""
            planetImageSource: "images/neptune.png"
            planetNumber:3
        }
        ListElement {
            name: ""
            planetImageSource: ""
            planetNumber: 100 // Defaults to solar system
        }
    }

    Component {
        id: planetButtonDelegate
        PlanetButton {
            source: planetImageSource
            text: name
            focusPlanet: planetNumber
            planetSelector: mainview
            buttonSize: planetButtonSize
            fontSize: textSize
        }
    }

    ListView {
        id: planetButtonView
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        anchors.rightMargin: planetButtonSize / 5
        anchors.bottomMargin: planetButtonSize / 7
        spacing: planetButtonSize / 7
        width: planetButtonSize * 1.4
        interactive: false
        model: planetModel
        delegate: planetButtonDelegate
    }


    StyledSlider {
        id: speedSlider
        anchors.top: parent.top
        anchors.topMargin: 10
        anchors.horizontalCenter: parent.horizontalCenter
        width: sliderLength
        value: 0.2
        minimumValue: 0
        maximumValue: 1
        onValueChanged: GLCode.onSpeedChanged(value);
    }
    Text {
        anchors.right: speedSlider.left
        anchors.verticalCenter: speedSlider.verticalCenter
        anchors.rightMargin: 10
        font.family: "Helvetica"
        font.pixelSize: textSize
        font.weight: Font.Light
        color: "white"
        text: "Rotation Speed"
    }

    StyledSlider {
        id: scaleSlider
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 10
        anchors.horizontalCenter: parent.horizontalCenter
        width: sliderLength
        value: 1200
        minimumValue: 1
        maximumValue: 2000
        onValueChanged: GLCode.setScale(value);
    }
    Text {
        anchors.right: scaleSlider.left
        anchors.verticalCenter: scaleSlider.verticalCenter
        anchors.rightMargin: 10
        font.family: "Helvetica"
        font.pixelSize: textSize
        font.weight: Font.Light
        color: "white"
        text: "Planet Size"
    }

    StyledSlider {
        id: distanceSlider
        anchors.right: parent.right
        anchors.leftMargin: 10
        anchors.verticalCenter: parent.verticalCenter
        orientation: Qt.Vertical
        height: sliderLength
        value: 1
        minimumValue: 0
        maximumValue: 10
        //! [2]
        onValueChanged: GLCode.setCameraDistance(value);
        //! [2]
    }
    Text {
        y: distanceSlider.y + distanceSlider.height + width + 10
        x: distanceSlider.x + 30 - textSize
        transform: Rotation {
            origin.x: 0;
            origin.y: 0;
            angle: -90
        }
        font.family: "Helvetica"
        font.pixelSize: textSize
        font.weight: Font.Light
        color: "white"
        text: "Viewing Distance"
    }

    // FPS display, initially hidden, clicking will show it
    FpsDisplay {
        id: fpsDisplay
        anchors.left: parent.left
        anchors.top: parent.top
        width: 32
        height: 64
        hidden: true
    }
    StyledSlider {
        id:x0_PositionSlider
        anchors.left: parent.left
        anchors.leftMargin: 48
        anchors.verticalCenter: parent.verticalCenter
        orientation: Qt.Vertical
        height: sliderLength/2
        anchors.verticalCenterOffset: 240
        value: 1
        minimumValue: 0
        maximumValue: 10
        //! [2]
        onValueChanged: GLCode.setX0_Position(value);
        //! [2]
    }

    StyledSlider {
        id: y0_PositionSlider
        anchors.left: parent.left
        anchors.leftMargin: 134
        anchors.verticalCenter: parent.verticalCenter
        orientation: Qt.Vertical
        height: sliderLength/2
        anchors.verticalCenterOffset: 238
        value: 1
        minimumValue: 0
        maximumValue: 10
        //! [2]
        onValueChanged: GLCode.setY0_Position(value);
        //! [2]
    }
    StyledSlider {
            id: setCameraDirection
            anchors.left: parent.left
            anchors.leftMargin: 48
            anchors.verticalCenter: parent.verticalCenter
            orientation: Qt.Vertical
            height: sliderLength/2
            anchors.verticalCenterOffset: 6
            value: 1
            minimumValue: 0
            maximumValue: 10
            //! [2]
            onValueChanged: GLCode.setCameraDirection(value);
            //! [2]
    }
    StyledSlider {
            id: setCameraAngle
            anchors.left: parent.left
            anchors.leftMargin: 48
            anchors.verticalCenter: parent.verticalCenter
            orientation: Qt.Vertical
            height: sliderLength/2
            anchors.verticalCenterOffset: -229
            value: 1
            minimumValue: 0
            maximumValue: 10
            //! [2]
            onValueChanged: GLCode.setCameraAngle(value);
            //! [2]
    }
}
