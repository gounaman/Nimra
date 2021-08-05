# Nimra
English/Arabic calculator

/**** This app is best viewed on a Chrome or Edge browser running on a laptop or desktop computer ****/
/**** It may not not line up correctly on certain mobile devices, particularly those that use Safari, which appears to have major issues correctly dealing with CSS grid ****/

Nimra (aka : نمرة ) means "number" in Arabic.
Nimra is a standalone HTML/CSS/JS calculator application that has no dependencies on outside frameworks or
libraries, other than a Google Arabic font.
It supports elementary arithmetic and basic mathematical calculations that are displayed in Arabic and English.
End-users can toggle the keypad between English and Arabic.
All expressions are input via the calculator's keypad.
Nimra relies heavily on a JavaScript class (the "tokenizer"), which dynamically tracks end-user input. 
The tokenizer hides the implementation details that validate parsed expressions.
Nimra has been designed to be easily customized by other developers who may wish to add dropdown menus, additional functions, 
or make use of an "info box" that sits at the top of the application.
