/**
 * Marlin 3D Printer Firmware
 * Copyright (c) 2022 MarlinFirmware [https://github.com/MarlinFirmware/Marlin]
 *
 */
#pragma once

#define CONFIG_EXAMPLES_DIR "Creality/Ender-3 V2/BigTreeTech SKR Mini E3 v3/MarlinUI"

#define CONFIGURATION_H_VERSION 02010300

//===========================================================================
//============================= Getting Started =============================
//===========================================================================

// @section info

// Author info of this build printed to the host during boot and M115
#define STRING_CONFIG_H_AUTHOR "psuchris" // Who made the changes.
//#define CUSTOM_VERSION_FILE Version.h // Path from the root directory (no quotes)

// @section machine

// Choose the name from boards.h that matches your setup
#ifndef MOTHERBOARD
  #define MOTHERBOARD BOARD_BTT_SKR_MINI_E3_V3_0
#endif

/**
 * Select the serial port on the board to use for communication with the host.
 * This allows the connection of wireless adapters (for instance) to non-default port pins.
 * Serial port -1 is the USB emulated serial port, if available.
 * Note: The first serial port (-1 or 0) will always be used by the Arduino bootloader.
 *
 * :[-1, 0, 1, 2, 3, 4, 5, 6, 7]
 */
#define SERIAL_PORT -1

/**
 * Serial Port Baud Rate
 *
 * :[2400, 9600, 19200, 38400, 57600, 115200, 250000, 500000, 1000000]
 */
#define BAUDRATE 115200

//#define BAUD_RATE_GCODE     // Enable G-code M575 to set the baud rate

/**
 * Select a secondary serial port on the board to use for communication with the host.
 * Currently Ethernet (-2) is only supported on Teensy 4.1 boards.
 * :[-2, -1, 0, 1, 2, 3, 4, 5, 6, 7]
 */
#define SERIAL_PORT_2 2
//#define BAUDRATE_2 250000   // :[2400, 9600, 19200, 38400, 57600, 115200, 250000, 500000, 1000000] Enable to override BAUDRATE

/**
 * Select a third serial port on the board to use for communication with the host.
 * Currently only supported for AVR, DUE, LPC1768/9 and STM32/STM32F1
 * :[-1, 0, 1, 2, 3, 4, 5, 6, 7]
 */
//#define SERIAL_PORT_3 1
//#define BAUDRATE_3 250000   // :[2400, 9600, 19200, 38400, 57600, 115200, 250000, 500000, 1000000] Enable to override BAUDRATE

/**
 * Select a serial port to communicate with RS485 protocol
 * :[-1, 0, 1, 2, 3, 4, 5, 6, 7]
 */
//#define RS485_SERIAL_PORT 1
#ifdef RS485_SERIAL_PORT
  //#define RS485_BUS_BUFFER_SIZE 128
#endif

// Enable the Bluetooth serial interface on AT90USB devices
#define BLUETOOTH	// test

// Name displayed in the LCD "Ready" message and Info menu
#define CUSTOM_MACHINE_NAME "Plopper"

// Printer's unique ID, used by some programs to differentiate between machines.
// Choose your own or use a service like https://www.uuidgenerator.net/version4
//#define MACHINE_UUID "00000000-0000-0000-0000-000000000000"

// @section stepper drivers

/**
 * Stepper Drivers
 *
 * :['A4988', 'A5984', 'DRV8825', 'LV8729', 'TB6560', 'TB6600', 'TMC2100', 'TMC2130', 'TMC2130_STANDALONE', 'TMC2160', 'TMC2160_STANDALONE', 'TMC2208', 'TMC2208_STANDALONE', 'TMC2209', 'TMC2209_STANDALONE', 'TMC26X', 'TMC26X_STANDALONE', 'TMC2660', 'TMC2660_STANDALONE', 'TMC5130', 'TMC5130_STANDALONE', 'TMC5160', 'TMC5160_STANDALONE']
 */
#define X_DRIVER_TYPE TMC2209
#define Y_DRIVER_TYPE TMC2209
#define Z_DRIVER_TYPE TMC2209
//#define I_DRIVER_TYPE  A4988
#define J_DRIVER_TYPE  A4988
//#define K_DRIVER_TYPE  A4988
#define E0_DRIVER_TYPE TMC2209

#ifdef I_DRIVER_TYPE
  #define AXIS4_NAME 'A' // :['A', 'B', 'C', 'U', 'V', 'W']
  #define AXIS4_ROTATES
#endif
#ifdef J_DRIVER_TYPE
  #define AXIS5_NAME 'B' // :['B', 'C', 'U', 'V', 'W']
  #define AXIS5_ROTATES
#endif
#ifdef K_DRIVER_TYPE
  #define AXIS6_NAME 'C' // :['C', 'U', 'V', 'W']
  #define AXIS6_ROTATES
#endif

// @section extruder

// This defines the number of extruders
// :[0, 1, 2, 3, 4, 5, 6, 7, 8]
#define EXTRUDERS 1

// Generally expected filament diameter (1.75, 2.85, 3.0, ...). Used for Volumetric, Filament Width Sensor, etc.
#define DEFAULT_NOMINAL_FILAMENT_DIA 1.75

// For Cyclops or any "multi-extruder" that shares a single nozzle.
//#define SINGLENOZZLE

// Save and restore temperature and fan speed on tool-change.
// Set standby for the unselected tool with M104/106/109 T...
#if ENABLED(SINGLENOZZLE)
  //#define SINGLENOZZLE_STANDBY_TEMP
  //#define SINGLENOZZLE_STANDBY_FAN
#endif

// A dual extruder that uses a single stepper motor
//#define SWITCHING_EXTRUDER
#if ENABLED(SWITCHING_EXTRUDER)
  #define SWITCHING_EXTRUDER_SERVO_NR 0
  #define SWITCHING_EXTRUDER_SERVO_ANGLES { 0, 90 } // Angles for E0, E1[, E2, E3]
  #if EXTRUDERS > 3
    #define SWITCHING_EXTRUDER_E23_SERVO_NR 1
  #endif
#endif

//#define ELECTROMAGNETIC_SWITCHING_TOOLHEAD

#if ANY(SWITCHING_TOOLHEAD, MAGNETIC_SWITCHING_TOOLHEAD, ELECTROMAGNETIC_SWITCHING_TOOLHEAD)
  #define SWITCHING_TOOLHEAD_Y_POS          235         // (mm) Y position of the toolhead dock
  #define SWITCHING_TOOLHEAD_X_POS          { 215, 0 }  // (mm) X positions for parking the extruders
  #if ENABLED(SWITCHING_TOOLHEAD)
    #define SWITCHING_TOOLHEAD_SERVO_NR       2         // Index of the servo connector
    #define SWITCHING_TOOLHEAD_SERVO_ANGLES { 0, 180 }  // (degrees) Angles for Lock, Unlock
  #elif ENABLED(MAGNETIC_SWITCHING_TOOLHEAD)
    #define SWITCHING_TOOLHEAD_Y_RELEASE      5         // (mm) Security distance Y axis
    #define SWITCHING_TOOLHEAD_X_SECURITY   { 90, 150 } // (mm) Security distance X axis (T0,T1)
    //#define PRIME_BEFORE_REMOVE                       // Prime the nozzle before release from the dock
    #if ENABLED(PRIME_BEFORE_REMOVE)
      #define SWITCHING_TOOLHEAD_RETRACT_FEEDRATE 2400  // (mm/min) Extruder retract feedrate
    #endif
  #elif ENABLED(ELECTROMAGNETIC_SWITCHING_TOOLHEAD)
    #define SWITCHING_TOOLHEAD_Z_HOP          2         // (mm) Z raise for switching
  #endif
#endif

#if TEMP_SENSOR_IS_MAX_TC(1)
  #define MAX31865_SENSOR_OHMS_1      100
  #define MAX31865_CALIBRATION_OHMS_1 430
#endif
#if TEMP_SENSOR_IS_MAX_TC(2)
  #define MAX31865_SENSOR_OHMS_2      100
  #define MAX31865_CALIBRATION_OHMS_2 430
#endif

#if HAS_E_TEMP_SENSOR
  #define TEMP_RESIDENCY_TIME         10  // (seconds) Time to wait for hotend to "settle" in M109
  #define TEMP_WINDOW                  1  // (°C) Temperature proximity for the "temperature reached" timer
  #define TEMP_HYSTERESIS              3  // (°C) Temperature proximity considered "close enough" to the target
#endif

/**
 * Default Axis Steps Per Unit (linear=steps/mm, rotational=steps/°)
 * Override with M92
 *                                      X, Y, Z [, I [, J [, K...]]], E0 [, E1[, E2...]]
 */
#define DEFAULT_AXIS_STEPS_PER_UNIT   { 80, 80, 400, 93 }

//#define MAG_MOUNTED_PROBE
#if ENABLED(MAG_MOUNTED_PROBE)
  #define PROBE_DEPLOY_FEEDRATE (133*60)  // (mm/min) Probe deploy speed

  #define MAG_MOUNTED_DEPLOY_1 { PROBE_DEPLOY_FEEDRATE, { 245, 114, 30 } }  // Move to side Dock & Attach probe
#endif

// Feedrate (mm/min) for the first approach when double-probing (MULTIPLE_PROBING == 2)
#define Z_PROBE_FEEDRATE_FAST (4*60)

// For M851 provide ranges for adjusting the X, Y, and Z probe offsets
//#define PROBE_OFFSET_XMIN -50   // (mm)
//#define PROBE_OFFSET_XMAX  50   // (mm)

// For Inverting Stepper Enable Pins (Active Low) use 0, Non Inverting (Active High) use 1
// :{ 0:'Low', 1:'High' }
#define X_ENABLE_ON 0
#define Y_ENABLE_ON 0
#define Z_ENABLE_ON 0

#if ANY(AUTO_BED_LEVELING_LINEAR, AUTO_BED_LEVELING_BILINEAR)
#elif ENABLED(AUTO_BED_LEVELING_UBL)

  /**
   * Probing not allowed within the position of an obstacle.
   */
  //#define AVOID_OBSTACLES
  #if ENABLED(AVOID_OBSTACLES)
    #define CLIP_W  23  // Bed clip width, should be padded a few mm over its physical size
    #define CLIP_H  14  // Bed clip height, should be padded a few mm over its physical size

    // Obstacle Rectangles defined as { X1, Y1, X2, Y2 }
    #define OBSTACLE1 { (X_BED_SIZE) / 4     - (CLIP_W) / 2,                       0, (X_BED_SIZE) / 4     + (CLIP_W) / 2, CLIP_H }
    #define OBSTACLE2 { (X_BED_SIZE) * 3 / 4 - (CLIP_W) / 2,                       0, (X_BED_SIZE) * 3 / 4 + (CLIP_W) / 2, CLIP_H }
    #define OBSTACLE3 { (X_BED_SIZE) / 4     - (CLIP_W) / 2, (Y_BED_SIZE) - (CLIP_H), (X_BED_SIZE) / 4     + (CLIP_W) / 2, Y_BED_SIZE }
    #define OBSTACLE4 { (X_BED_SIZE) * 3 / 4 - (CLIP_W) / 2, (Y_BED_SIZE) - (CLIP_H), (X_BED_SIZE) * 3 / 4 + (CLIP_W) / 2, Y_BED_SIZE }

    // The probed grid must be inset for G29 J. This is okay, since it is
    // only used to compute a linear transformation for the mesh itself.
    #define G29J_MESH_TILT_MARGIN ((CLIP_H) + 1)
  #endif

#endif // BED_LEVELING

// Homing speeds (linear=mm/min, rotational=°/min)
#define HOMING_FEEDRATE_MM_M { (50*60), (50*60), (4*60) }

//#define SKEW_CORRECTION

#if ENABLED(SKEW_CORRECTION)
  // Input all length measurements here:
  #define XY_DIAG_AC 282.8427124746

  //#define SKEW_CORRECTION_FOR_Z
  #if ENABLED(SKEW_CORRECTION_FOR_Z)
    #define XZ_DIAG_AC 282.8427124746
  #endif
#endif

//
// Preheat Constants - Up to 10 are supported without changes
//
#define PREHEAT_1_LABEL       "PLA"
#define PREHEAT_1_TEMP_HOTEND 185

// @section motion

/**
 * Nozzle Park
 *
 */
#define NOZZLE_PARK_FEATURE

#if ENABLED(NOZZLE_PARK_FEATURE)
  // Specify a park position as { X, Y, Z_raise }
  #define NOZZLE_PARK_POINT { (X_MIN_POS + 10), (Y_MAX_POS - 10), 20 }
  #define NOZZLE_PARK_MOVE          0   // Park motion: 0 = XY Move, 1 = X Only, 2 = Y Only, 3 = X before Y, 4 = Y before X
#endif

/**
 * Clean Nozzle Feature
 *
 *          --
 *         |  (X0, Y1) |     /\        /\        /\     | (X1, Y1)
 *         |           |    /  \      /  \      /  \    |
 *       A |           |   /    \    /    \    /    \   |
 *         |           |  /      \  /      \  /      \  |
 *         |  (X0, Y0) | /        \/        \/        \ | (X1, Y0)
 *          --         +--------------------------------+
 *                       |________|_________|_________|
 *                           T1        T2        T3
 *
 */
//#define NOZZLE_CLEAN_FEATURE

#if ENABLED(NOZZLE_CLEAN_FEATURE)
  #define NOZZLE_CLEAN_PATTERN_CIRCLE   // Provide 'G12 P2' - a circular cleaning pattern

  // Specify positions for each tool as { { X, Y, Z }, { X, Y, Z } }
  // Dual hotend system may use { {  -20, (Y_BED_SIZE / 2), (Z_MIN_POS + 1) },  {  420, (Y_BED_SIZE / 2), (Z_MIN_POS + 1) }}
  #define NOZZLE_CLEAN_START_POINT { {  30, 30, (Z_MIN_POS + 1) } }
  #define NOZZLE_CLEAN_END_POINT   { { 100, 60, (Z_MIN_POS + 1) } }

  #if ENABLED(NOZZLE_CLEAN_PATTERN_CIRCLE)
    #define NOZZLE_CLEAN_CIRCLE_MIDDLE NOZZLE_CLEAN_START_POINT // Middle point of circle
  #endif

  // Move the nozzle to the initial position after cleaning
  #define NOZZLE_CLEAN_GOBACK

  // Explicit wipe G-code script applies to a G12 with no arguments.
  //#define WIPE_SEQUENCE_COMMANDS "G1 X-17 Y25 Z10 F4000\nG1 Z1\nM114\nG1 X-17 Y25\nG1 X-17 Y95\nG1 X-17 Y25\nG1 X-17 Y95\nG1 X-17 Y25\nG1 X-17 Y95\nG1 X-17 Y25\nG1 X-17 Y95\nG1 X-17 Y25\nG1 X-17 Y95\nG1 X-17 Y25\nG1 X-17 Y95\nG1 Z15\nM400\nG0 X-10.0 Y-9.0"

#endif

//=============================================================================
//============================= LCD and SD support ============================
//=============================================================================

// @section interface

/**
 * LCD LANGUAGE
 *
 * Select the language to display on the LCD. These languages are available:
 *
 *   en, an, bg, ca, cz, da, de, el, el_CY, es, eu, fi, fr, gl, hr, hu, it,
 *   jp_kana, ko_KR, nl, pl, pt, pt_br, ro, ru, sk, sv, tr, uk, vi, zh_CN, zh_TW
 *
 * :{ 'en':'English', 'an':'Aragonese', 'bg':'Bulgarian', 'ca':'Catalan', 'cz':'Czech', 'da':'Danish', 'de':'German', 'el':'Greek (Greece)', 'el_CY':'Greek (Cyprus)', 'es':'Spanish', 'eu':'Basque-Euskera', 'fi':'Finnish', 'fr':'French', 'gl':'Galician', 'hr':'Croatian', 'hu':'Hungarian', 'it':'Italian', 'jp_kana':'Japanese', 'ko_KR':'Korean (South Korea)', 'nl':'Dutch', 'pl':'Polish', 'pt':'Portuguese', 'pt_br':'Portuguese (Brazilian)', 'ro':'Romanian', 'ru':'Russian', 'sk':'Slovak', 'sv':'Swedish', 'tr':'Turkish', 'uk':'Ukrainian', 'vi':'Vietnamese', 'zh_CN':'Chinese (Simplified)', 'zh_TW':'Chinese (Traditional)' }
 */
#define LCD_LANGUAGE en

/**
 * LCD Character Set
 *
 * :['JAPANESE', 'WESTERN', 'CYRILLIC']
 */
#define DISPLAY_CHARSET_HD44780 JAPANESE

/**
 * Info Screen Style (0:Classic, 1:Průša)
 *
 * :[0:'Classic', 1:'Průša']
 */
#define LCD_INFO_SCREEN_STYLE 0

//
// A sequence of tones to play at startup, in pairs of tone (Hz), duration (ms).
// Silence in-between tones.
//
//#define STARTUP_TUNE { 698, 300, 0, 50, 523, 50, 0, 25, 494, 50, 0, 25, 523, 100, 0, 50, 554, 300, 0, 100, 523, 300 }

//=============================================================================
//========================== Extensible UI Displays ===========================
//=============================================================================

/**
 * DGUS Touch Display with DWIN OS. (Choose one.)
 *
 * ORIGIN (Marlin DWIN_SET)
 *  - Download https://github.com/coldtobi/Marlin_DGUS_Resources
 *  - Copy the downloaded DWIN_SET folder to the SD card.
 *  - Product: https://www.aliexpress.com/item/32993409517.html
 *
 * FYSETC (Supplier default)
 *  - Download https://github.com/FYSETC/FYSTLCD-2.0
 *  - Copy the downloaded SCREEN folder to the SD card.
 *  - Product: https://www.aliexpress.com/item/32961471929.html
 *
 * HIPRECY (Supplier default)
 *  - Download https://github.com/HiPrecy/Touch-Lcd-LEO
 *  - Copy the downloaded DWIN_SET folder to the SD card.
 *
 * MKS (MKS-H43) (Supplier default)
 *  - Download https://github.com/makerbase-mks/MKS-H43
 *  - Copy the downloaded DWIN_SET folder to the SD card.
 *  - Product: https://www.aliexpress.com/item/1005002008179262.html
 *
 * RELOADED (T5UID1)
 *  - Download https://github.com/Neo2003/DGUS-reloaded/releases
 *  - Copy the downloaded DWIN_SET folder to the SD card.
 *
 * IA_CREALITY (T5UID1)
 *  - Download https://github.com/InsanityAutomation/Marlin/raw/CrealityDwin_2.0/TM3D_Combined480272_Landscape_V7.7z
 *  - Copy the downloaded DWIN_SET folder to the SD card.
 *
 * E3S1PRO (T5L)
 *  - Download https://github.com/CrealityOfficial/Ender-3S1/archive/3S1_Plus_Screen.zip
 *  - Copy the downloaded DWIN_SET folder to the SD card.
 *
 * CREALITY_TOUCH
 *  - CR-6 OEM touch screen. A DWIN display with touch.
 *
 * Flash display with DGUS Displays for Marlin:
 *  - Format the SD card to FAT32 with an allocation size of 4kb.
 *  - Download files as specified for your type of display.
 *  - Plug the microSD card into the back of the display.
 *  - Boot the display and wait for the update to complete.
 *
 * :[ 'ORIGIN', 'FYSETC', 'HYPRECY', 'MKS', 'RELOADED', 'IA_CREALITY', 'E3S1PRO', 'CREALITY_TOUCH' ]
 */
//#define DGUS_LCD_UI ORIGIN
#if DGUS_UI_IS(MKS)
  #define USE_MKS_GREEN_UI
#endif

//
// Generic TFT with detailed options
//
//#define TFT_GENERIC
#if ENABLED(TFT_GENERIC)
  // :[ 'AUTO', 'ST7735', 'ST7789', 'ST7796', 'R61505', 'ILI9328', 'ILI9341', 'ILI9488' ]
  #define TFT_DRIVER AUTO
#endif

//=============================================================================
//=============================== Extra Features ==============================
//=============================================================================

// @section fans

// Set number of user-controlled fans. Disable to use all board-defined fans.
// :[1,2,3,4,5,6,7,8]
//#define NUM_M106_FANS 1

//#define PASSWORD_FEATURE
#if ENABLED(PASSWORD_FEATURE)
  #define PASSWORD_LENGTH 4                 // (#) Number of digits (1-9). 3 or 4 is recommended
  #define PASSWORD_ON_STARTUP
  #define PASSWORD_UNLOCK_GCODE             // Unlock with the M511 P<password> command. Disable to prevent brute-force attack.
  #define PASSWORD_CHANGE_GCODE             // Change the password with M512 P<old> S<new>.
  //#define PASSWORD_ON_SD_PRINT_MENU       // This does not prevent G-codes from running
  //#define PASSWORD_AFTER_SD_PRINT_END
  //#define PASSWORD_AFTER_SD_PRINT_ABORT
  //#include "Configuration_Secure.h"       // External file with PASSWORD_DEFAULT_VALUE
#endif

#define Z_PROBE_ALLEN_KEY_DEPLOY_2 { 0.0, PRINTABLE_RADIUS, 100.0 }
#define Z_PROBE_ALLEN_KEY_DEPLOY_2_FEEDRATE (XY_PROBE_FEEDRATE)/10
