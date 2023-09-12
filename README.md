# adapt-pageNav

**PageNav** is a *presentation component* that adds basic navigation controls to a page.

<img src="demo.gif" alt="the page nav extension in action" align="right">

### When to use
Use **PageNav** as a replacement for the **Quicknav** component AND extension for both the Framework and the Authoring Tool going forwards.

## Settings Overview

The attributes listed below are used in *components.json* to configure **PageNav**, and are properly formatted as JSON in [*example.json*](https://github.com/cgkineo/adapt-pageNav/blob/master/example.json).

Navigation bar component which can contain some or all of the following buttons:

- `_root`: Navigates to the top level menu
- `_up`: Navigates to the menu that is the next level up in the hierarchy. For instance, a sub menu.
- `_previous`: Navigates to the previous page if it exists and is unlocked
- `_next`: Navigates to the next page if it exists and is unlocked
- `_close`: Closes the course window. Only possible if the course was launched in a popup window

The **PageNav** buttons will respect any [locking](https://github.com/adaptlearning/adapt_framework/wiki/Locking-objects-with-'_isLocked'-and-'_lockType'#using-locking-with-menus) that has been configured in Adapt. In cases not covered by Adapt's locking system - such as a [start page](https://github.com/adaptlearning/adapt_framework/wiki/Content-starts-with-course.json#example-1) that appears immediately before the main menu - the setting `_lockUntilPageComplete` can be used to disable the button until the current page has been completed.

### Attributes

[**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. [Read more](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes)

**\_component** (string): This value must be `pageNav` (one word)

**\_classes** (string): CSS class name to be applied to **PageNav**’s containing `div`. The class must be predefined in one of the Less files. Separate multiple classes with a space.

**\_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`.

**instruction** (string): This optional text appears above the component. It is frequently used to guide the learner’s interaction with the component.

**\_loopStyle** (string): Acceptable values are `allPages`, `siblings`, and `none`. Defaults to `none`.
- `allPages`: Loop sequentially through all pages in course
- `siblings`: Loop sequentially through all pages in current parent object
- `none`: Disable previous and next buttons at start and end of the pages in the current parent object.

**\_shouldSkipOptionalPages** (boolean): Skip pages that are set to `"_isOptional": true`. Default is `false`.

**\_buttons** (object): The following attributes configure the defaults for the **Quickanv** buttons. These attributes are available on all of the following buttons **\_previous**, **\_root**, **\_up**, **\_next**, and **\_close**.

#### Global button configurations

>**\_isEnabled** (boolean): Turns the button on and off. Acceptable values are `true` and `false`.

>**\_lockUntilPageComplete** (boolean): For use when the standard Adapt locking system doesn't apply, such as in a start page before the main menu. Locks a button until the current page is complete. Acceptable values are `true` and `false`. Defaults to `false`

>**\_order** (number): Defines the display order of the button. Numerical order with 0 rendering first.

>**\_classes** (string): CSS class name to be applied to the `button`. The class must be predefined in one of the Less files. Separate multiple classes with a space.

>**\_iconClass** (string): CSS class name to be applied to the `button` icon. The class must be predefined in one of the Less files with the corresponding icon included as part of a font. To have _no_ icon, leave this field blank. Suggested icons for each button are detailed in the [_example.json_](https://github.com/cgkineo/adapt-pageNav/blob/master/example.json). See the list of all available [_vanilla_ icons](https://github.com/adaptlearning/adapt-contrib-vanilla/wiki/Icons) to choose from.

>**\_iconAlignment** (string): Determines how the icon is aligned to the text. Options include `auto`, `left`, `right`, `top`, and `bottom`. When using `auto`, the position will automatically adjust based on whether the user is using an LTR or RTL lanaguage. The `_next` button will also be adjusted accordingly when using `auto` (i.e. the icon will be right-aligned for LTR and left-aligned for RTL). Defaults to `auto`.

>**text** (string): Defines the text that renders in the `button`.

>**ariaLabel** (string): This text is associated with the button. It renders as part of the aria label to give screen readers more information.

> **\_tooltip** (object): The tooltip object. Used when tooltips are enabled globally

>> **\_isEnabled** (boolean): Enables tooltips on the button

>> **text** (string): The text of the tooltip

#### **\_previous**, **\_root**, **\_up**, and **\_next** properties

>**\_customRouteId** (string): Overrides the route ID. For use when non standard route navigation is required.

----------------------------

**Framework versions:**  5.19.1+<br>
**Vanilla versions:**  5.1.1+<br>
**Author / maintainer:**  Kineo<br>
**Accessibility support:**  WAI AA<br>
**RTL support:**  Yes<br>
**Cross-platform coverage:** Chrome, Chrome for Android, Firefox (ESR + latest version), Edge, IE11, Safari 12+13 for macOS/iOS/iPadOS, Opera<br>
