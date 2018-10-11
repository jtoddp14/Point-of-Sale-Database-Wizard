var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var fs = require('fs');
var isFoodService = false;
var accuShift = false;
var rtl = true;
var hasVatTax = false;
var integratedRemoteDisplay = false;
var sageLiveIntegration = false;
var QBOIntegration = false;
var accounting = false;
var remoteDisplay = false;
var israCard = true;

app.get('*templates/*.html', function (req, res) {
    fs.readFile(path.join(__dirname + '/public/' +  req.path), 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }  
        var htmlString = getLiterals(data);
        res.send(htmlString);
    });
});

app.get('/js/*.js', function (req, res) {
    fs.readFile(path.join(__dirname + '/public/' +  req.path), 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }  
        var htmlString = getLiterals(data);
        res.send(htmlString);
    });
});


app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var staticLiterals = {
    'Log In' : 'התחבר',
    'Forgot Password' : 'שכחתי את הסיסמה',
    'Serial Number' : 'מספר סידורי',
    'Congrats on your purchase': 'איחולים לרכש התוכנה',
    'Before we get started' : 'לפני שנתחיל',
    'set a new password to use the next time you log in': 'הגדר סיסמה חדשה לשימוש בפעם הבאה שתתחבר',
    'Home' : 'עמוד ראשי',
    'Instructions' : 'הוראות/הדרכה',
    'Support' : 'סיוע',
    'Log Out' : 'יציאה',
    'CLICK HERE' : 'לחץ כאן',
    'and read the Terms and Conditions' : 'וקרא את תנאי העיסקה',
    'I agree to the Terms and Conditions' : 'הנני מסכים לתנאי העיסקה',
    'Password' : 'סיסמה',
    'Confirm Password' : 'הזן/אשר סיסמה',
    'Submit Password' : 'שלח סיסמה',
    '...Creating Database. Please Wait.': 'יוצרים מאגר מידע, נא המתן',
    'Company Information' : 'מידע על החברה',
    'Here we will get started with some basic information about your company. Some of it may already be filled out for .you, please confirm that everything is correct' : 'נתחיל עם כמה מידע בסיסי על החברה שלך. חלק ממנו עשוי להיות כבר מלא בשבילך, אנא ודא כי כל דבר הוא הנכון',
    'Company Name' : 'שם החברה',
    'Business Type' : 'סוג עסק',
    '..Choose' : 'בחר...',
    'Retail' : 'קימעונאות',
    'Food Services' : 'שרותי אוכל',
    'Combination' : 'מעורב',
    'Address' : 'כתובת',
    'State' : 'מדינה',
    'Province' : 'מָחוֹז',
    'City' : 'עיר',
    'Zip' : 'מיקוד',
    'Save and Proceed to the Next Step' : 'שמור ועבר לשלב הבא',
    'Retail Settings' : 'הגדרות קמעונאיות',
    'These options will help you get started if any of your stations will be runing in Retail mode. If you are only running Food .Service, you can skip this page' : 'אפשרויות אלה יעזרו לך להתחיל עם כל תחנות המכירה הם לקימעונאות. אם אתה מפעיל רק שירות מזון. תוכל לדלג על דף זה',
    'Keep Track of Sales Reps' : 'עקוב אחר נציגי המכירות',
    'Price Decimal Digits' : 'מס. עשרוני למכירות', 
    'The number of decimal digits the Price of each item can have' : 'מחיר - מספר הספרות העשרוניות למחיר יכול להיות',
    'Quantity Decimal Digits' : 'מס. עשרוני לכמויות',
    'The number of decimal digits the Quantity of each item can have' : 'כמות - מספר הספרות העשרוניות לפריט זה יכול להיות',
    'Total Decimal Digits' : 'מס. עשרוני לסה"כ',
    'The number of decimal digits the Total of each order can have' : 'סה"כ - מספר הספרות העשרוניות לסה"כ  יכול להיות',
    'Return to Previous Page' : 'חזור לדף הקודם',
    'Enter Your Password' : 'הזן סיסמה',
    'An error has occured' : 'טעות אירעה במערכת',
    'Users': 'משתמשים',
    'Here you can start to add in users to the appropriate groups' : 'כאן תוכל להוסיף משתמשים לקבוצות המתאימות',
    'We have set up some default groups for you' : 'הגדרנו עבורך כמה קבוצות ברירת מחדל', 
    'but you can always add more or edit theses later': 'אבל אתה תמיד יכול להוסיף עוד או לערוך תזות מאוחר יותר',
    'Admin': 'מנהלה',
    'Owner/Operator of the setup and management of the software, has full access' : 'הבעלים / מפעיל  שיש גישה מלאה  להתקנה וניהול של התוכנה',
    'Current Users': 'משתמשים נוכחיים',
    'Users I Administrators': 'מנהלים / משתמשים',
    'Auto Till' :'קופה אוטומטית',
    'Auto Log Out' : 'יציאה אוטומטית',
    'Add an Administrator': 'הוסף מנהל',
    'cancel': 'בטל',
    'Manager':'אחראי משמרת',
    'Daily operator and manager of the POS users': 'מפעיל יומי ומנהל של משתמשי קופה', 
    'has access to most functions' : 'יש גישה לרוב הפונקציות',
    'Add a Manager': 'הוסף אחראי משמרת',
    'Server': 'שרת',
    'Has access to make sales and use functions in the POS but not in management':'יש גישה לבצע מכירות ושימוש פונקציות קופה אבל לא לפונקצית ניהול',
    'Add a Server':'הוסף שרת',
    'Cashier': 'קופאי',
    'Other users that can use the POS but hace no access to any management functions': 'משתמשים אחרים הרשאים להשתמש בקופה, אבלאין להם גישה לפונקציות ניהול',
    'Add a Cashier' : 'הוסף קופאי',
    'Home':'עמוד ראשי',
    'Instructions':'הוראות/הדרכה',
    'Support':'סיוע',
    'Log Out':'יציאה',
    'LOG IN':'התחבר',
    'FORGOT PASSWORD':'שכחתי את הסיסמה',
    'Serial Number':'מספר סידורי',
    'Congrats on your purchase':'איחולים לרכש התוכנה',
    'Before we get started':'לפני שנתחיל,',
    'Click Here':'לחץ כאן',
    'and read the Terms and Conditions':'וקרא את תנאי העיסקה',
    'I agree to the Terms and Conditions':'הנני מסכים לתנאי העיסקה',
    'Password':'סיסמה',
    'Confirm Password':'הזן/אשר סיסמה',
    'Submit Password':'שלח סיסמה',
    '...Creating Database. Please Wait.':'יוצרים מאגר מידע, נא המתן',
    'Company Information':'מידע על החברה',
    'Here we will get started with some basic information about your company':'בעמוד זה נתחיל במידע בסיסי על החברה.',
    'Company Name':'שם החברה',
    'Business Type':'סוג עסק',
    '...Choose':'בחר...',
    'Retail':'קמעונאות',
    'Food Service':'שרותי אוכל',
    'Combination':'מעורב',
    'Address':'כתובת',
    'State':'מדינה',
    'City':'עיר',
    'Zip':'מיקוד',
    'Retail Settings':'הגדרות קמעונאיות',
    'These options will help you get started if any of your stations will be running in Retail mode':'בעמוד זה מוצאות אפשרויות שיעזרו בתפעול מיכירה קמעונית,',
    'Keep Track of Sales Reps':'עקוב אחר נציגי המכירות',
    'Price Decimal Digits':'מס. עשרוני למכירות', 
    'The number of decimal digits the Price of each item can have':'מחיר - מספר הספרות העשרוניות למחיר יכול להיות',
    'Quantity Decimal Digits':'מס. עשרוני לכמויות',
    'The number of decimal digits the Quantity of .each item can have':'כמות - מספר הספרות העשרוניות לפריט זה יכול להיות',
    'Total Decimal Digits':'מס. עשרוני לסה"כ',
    'The number of decimal digits the Total of each order can have':'סה"כ - מספר הספרות העשרוניות לסה"כ  יכול להיות',
    'RETURN TO PREVIOUS PAGE':'חזור לדף הקודם',
    'Enter Your Password':'הזן סיסמה',
    'An error has occured':'טעות אירעה במערכת',
    'Users':'משתמשים',
    'Here you can start to add in users to the appropriate groups':'בעמוד זה תוכל לבחור את הקבוצה המתאימה וליצור מששתמשים בהתאם',
    'Admin':'מנהל מערכת',
    'Owner':'בעלים',
    'Current Users':'משתמשים נוכחיים',
    'Users I Administrators':'מנהלים / משתמשים',
    'Auto Till':'קופה אוטומטית:',
    'Auto Log Out':'יציאה אוטומטית',
    'ADD AN ADMINISTRATOR':'הוסף מנהל מערכת',
    'CANCEL':'בטל',
    'Manager':'מנהל משמרת',
    'Daily operator and manager of the POS users':'מנהל משמרת ומפעיל עמדה,',
    'ADD A MANAGER':'הוסף מנהל',
    'Server':'מנהל שרת',
    'Has access to make sales and use functions in the POS but not in management':'יש גישה לבצע מכירות ושימוש פונקציות קופה, אבל לא לפונקצית ניהול',
    'ADD A SERVER':'הוסף מנהל שרת',
    'Cashier':'קופאי',
    'Other users that can use the POS but hace no access to any management functions':'משתמשים אחרים הרשאים להשתמש בקופה, אבל אין להם גישה לפונקציות ניהול',
    'ADD A CASHIER':'הוסף קופאי',
    'it didnt work':'זה לא עבד',
    'Please enter a valid password':'הזן סיסמה נכונה',
    'New User Click Here':'לקוח חדש לחץ פה',
    'SAVE AND PROCEED TO THE NEXT STEP':'שמור ועבור לשלב הבא',
    'There was a problem saving company information settings':'יש בעייה בשמירת עריכת מידע העסק',
    'Receipt Settings':'עריכת קבלה',
    'Here you will set up how your receipts will look when they print out':'בעמוד זה יתאפשר להגדיר את מראה הקבלה בהדפסה.',
    'Print Item SKU':'הדפס קוד מוצר',
    'Print Company Logo':'הדפס סמל חברה',
    'Print Company Details':'הדפס נתוני החברה',
    'Name':'שם',
    'Currency Decimal Digits':'מס. עשרוניות לסכום',
    'The number of decimal digits for currency amounts':'מהו המספר העשרוני המעודף לסכום',
    'Quantity Decimal Digits':'מס. עשרוני לכמויות',
    'The number of decimal digits for Quantity amunts':'מהו המספר העשרוני המעודף לכמויות',
    'Data':'חאריך',
    'MM/DD/YY HH:mm':'חודש/יום/שנה שעה:דקות',
    'Custom message':'הודעה לתחתית הקבלה',
    'Savings message':'הודעות שמורות',
    'Call Number':'מס. מכירה',
    'Item Count':'מספר פריטים ',
    'Completed':'סיום',
    'Products':'מוצרים',
    'Receipts':'קבלות',
    'Info':'מידע',
    'YOUR':'סמל',
    'LOGO':'העסק',
    'HERE':'פה',
    'YOUR LOGO HERE':'סמל העסק פה',
    'Add POS User':'הוסף משתמש מערכת',
    'Auto Till':'קופה אוטומטית',
    'Idle Timeout':'זמ] לסגירת מסך',
    'Set Password':'יצור סיסמה',
    'User is a Delivery Driver ':'משתמש הוא נהג משלוחים',
    'User is a Server':'המשתמש הוא מלצר',
    'DELETE':'הסר',
    'CANCEL':'בטל',
    'SAVE':'שמור',
    'Enter user name':'הכנס שם משתמש',
    'Never':'אף פעם',
    'This field is mandatory and cannot contain special characters':'שדה חובה-נא השלם, אין להשתמש באותיות מיוחדות',
    'This field cant be empty or contain special charcters':'נא השלם שדה זה, אין להשתמש באותיות מיוחדות',
    'Seconds 5':'5 שניות',
    'Seconds 10':'10 שניות',
    'Seconds 30':'30 שניות',
    'Minute 1':'1 דקה',
    'Minutes 2':'2 דקות',
    'Cashiers':'קופאים',
    'Managers':'מנהלים',
    'Servers':'מנהלי שרת',
    'Confirm Deletion':'אשר הסרת משתמש',
    'Administrators':'מנהלי תוכנה',
    'User name':'שם משתמש',
    'Second':'שניה',
    'Seconds':'שניות',
    'Minute':'דקה',
    'Minutes':'דקות',
    'PROCEED TO RETAIL SETTINGS':'עבור לעריכת קמעונאות',
    'set a new password to use the next time you log in':'הגדר סיסמה חדשה לשימוש בפעם הבאה שתתחבר',
    'Some of it may already be filled out for you':'נא השלם מידע לשדות,',
    'Province':'מָחוֹז','please confirm that everything below is correct':'אנא ודא שהמידע  נכון',
    'If you are only running Food Service':'השלם את בחירתך,',
    'you can skip this page':'לחץ על שמור ועבור לעמוד הבא',
    'With':'עם',
    'Sales Reps':'נציגי מכירות',
    'enabled':'נבחר',
    'you can mark your POS users as Sales Reps':'אתה יכול לסמן את משתמשי הקופה  כנציגי מכירות',
    'attributing sales to each individual':'ולייחס את המכירה למשתמש',
    'We have set up some default groups for you':'הגדרנו עבורך כמה קבוצות בסיסיות',
    'but you can always add more or edit these later':'אבל אתה תמיד יתאפשר להוסיף או לערוך משתמשים מאוחר יותר',
    'Operator of the setup and management of the software':'בעלי גישה מלאה',
    'has full access':'להתקנה וניהול התוכנה',
    'Administrators':'מנהלים',
    'has access to most functions':'יש גישה לרוב הפונקציות',
    'Select which station youll be printing from on the left and pick your settings':'בחר מדפסת והשלם את ההגדרות המעודפות', 
    'company':'חֶברָה',
    'phone number':'מספר טלפון',
    'address':'כתובת',
    'Time Format':'פורמט זמן',
    'PROCEED TO RETAIL SETTINGS':'<עבור להגדרות קמעונאיות',
    'PROCEED TO USER SETTINGS':'עבור להגדרות משתמשים',
    'RETURN TO COMPANY INFO':'חזור למידע החברה',
    'RETURN TO RETAIL SETTINGS':'חזור להגדרות קמעונאיות',
    'PROCEED TO RECEIPT SETTINGS':'עבור להגדרת קבלות',
    'PROCEED TO ITEM SETUP':'עבור להגדרת פריט',
    'RETURN TO RECEIPT SETTINGS':'חזור להגדרת קבלות',
    'RETURN TO POS USERS':'חזור להגדרות משתמשי קופה',
    'User is a Server':'המשתמש הוא מנהל  שרת',
    'User is a Delivery Driver':'המשתמש הוא נהג משלוחים',
    'Are you sure that you would like to remove this POS User':'האם אתה בטוח שברצונך להסיר משתמש קופה זה',

    'Product Lines':'קווי מוצר',
    'The first step in setting up the items you sell in your POS will be define your Product Lines':'בשלב הראשון ולפני עריכת פריטי המחירה, מומלץ להגדיר את קווי המוצר',
    'Procuct lines will help you group your items togather,':'הגדרות קווי המוצר יסיעו לאחד מס פרוטים בקבוצה',
    'giving set characteristics to each item the product line':'שתאפיין יחודיות לפריט יחד עם קו המוצר',
    'This will help you quickly set up your items and more later':'פעולה זו תסייע בארגון מהיר ויעיל בערוכת פריטים',
};

//staticLiterals = {};

var keys = Object.keys(staticLiterals);
var xml = "";
for (var i = 0; i < keys.length; i++) {
    //<Literal><Name>Adjust Inventory Page</Name><Text>
    xml += `<Literal><Name>${keys[i]}</Name><Text>${staticLiterals[keys[i]]}</Text></Literal>\n`;
}


var getLiterals = function (data) {
    var regex = /{Literal}([\w\s-_\/:]+){\/Literal}/i;
    var htmlResult = data;
    var matches;
    do {
        matches = regex.exec(htmlResult);
        if (matches) {
            var wholeTag = matches[0];
            var literalName = matches[1];
            var result = literalName;
            if (typeof staticLiterals[literalName] !== 'undefined') {
                result = staticLiterals[literalName];
            }
            htmlResult = htmlResult.replace(wholeTag, result);
        }
    } while (matches);
    return htmlResult;
};

app.get('/', function (req, res) {
    fs.readFile(path.join(__dirname + '/index.html'), 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }  
        var htmlString = getLiterals(data);
        res.send(htmlString);
    });
});

var tills = [
    {
        "id": "100",
        "users": [
            "ApAdmin"
        ],
        "name": "100",
        "ready": true,
        "hasOrders": true,
        "cash": 100,
        "glDept": "200a",
        "tenderOrders": true,
        "openDrawer": false,
        "autoZ": true,
        "zOutTime": "01:59 PM"
    },
    {
        "id": "200",
        "users": [],
        "name": "200",
        "ready": true,
        "hasOrders": true,
        "cash": 200,
        "glDept": "9999",
        "tenderOrders": false,
        "openDrawer": true,
        "autoZ": true,
        "zOutTime": "11:01 AM"
    },
    {
        "id": "Master",
        "users": [],
        "name": "Master",
        "ready": true,
        "hasOrders": false,
        "cash": 1500,
        "glDept": "asdfasdf",
        "tenderOrders": false,
        "openDrawer": true,
        "autoZ": false,
        "zOutTime": "06:00 AM"
    }
];

var userData = [
    {
        name: "Bethany",
        userId: '0',
        userGroup: 'Admin',
        passcode: '666',
        id: "Bethany",
        till:"Master",
        isServer:!0,
        isDriver:!1,
        idleTimeout: "",
    },
    {
        name: "Brad",
        userId: '1',
        userGroup: 'Admin',
        serverId:2,
        passcode: '123',
        id: "Brad",
        till:"Master",
        isServer:!0,
        isDriver:!0,
        idleTimeout: ""
    },
    {
        name: "Caroline",
        userId: '2',
        userGroup: 'Manager',
        serverId:3,
        passcode: '111',
        id: "Caroline",
        till:"Master Only",
        isServer:!0,
        isDriver:!1,
        idleTimeout: "120",
    },
    {
        name: "Danny",
        userId: '3',
        userGroup: 'Manager',
        serverId:4,
        passcode: '21354',
        id: "Danny",
        till:"Master Only",
        isServer:!0,
        isDriver:!1,
        idleTimeout: "120",
    },
    {
        name: "Darren",
        userId: '4',
        userGroup: 'Manager',
        serverId:5,
        passcode: '23114',
        id: "Darren",
        till:"Master Only",
        isServer:!1,
        isDriver:!1,
        idleTimeout: "120",
    },
    {
        name: "Derek",
        userId: '5',
        userGroup: 'Server',
        serverId:6,
        passcode: '777',
        id: "Derek",
        till:"100",
        isServer:!0,
        isDriver:!0,
        idleTimeout: "30",
    },
    {
        name: "Frank",
        userId: '6',
        userGroup: 'Server',
        serverId:7,
        passcode: '123456',
        id: "Frank",
        till:"100",
        isServer:!0,
        isDriver:!0,
        idleTimeout:"30",
    },
    {
        name: "Gary",
        userId: '7',
        userGroup: 'Server',
        serverId:8,
        passcode: 'look',
        id: "Gary",
        till:"100",
        isServer:!1,
        isDriver:!1,
        idleTimeout:"30",
    },
    {
        name: "Gwen",
        userId: '8',
        userGroup: 'Server',
        serverId:9,
        passcode: 'this',
        id: "Gwen",
        till:"100",
        isServer:!0,
        isDriver:!1,
        idleTimeout:"30",
    },
    {
        name: "Harry",
        userId: '9',
        userGroup: 'Server',
        serverId:10,
        passcode: 'is',
        id: "Harry",
        till:"100",
        isServer:!0,
        isDriver:!1,
        idleTimeout:"30",
    },
    {
        name: "Hector",
        userId: '10',
        userGroup: 'Server',
        serverId:11,
        passcode: 'a',
        id: "Hector",
        till:"100",
        isServer:!0,
        isDriver:!0,
        idleTimeout:"30",
    },
    {
        name: "Ingrid",
        userId: '11',
        userGroup: 'Cashier',
        serverId:12,
        passcode: 'password',
        id: "Ingrid",
        till:"100",
        isServer:!0,
        isDriver:!0,
        idleTimeout: "10",
    },
    {
        name: "Jake",
        userGroup: 'Cashier',
        serverId:13,
        passcode: 'at',
        id: "Jake",
        till:"100",
        isServer:!0,
        isDriver:!1,
        idleTimeout: "10",
    },
    {
        name: "Jeff",
        userGroup: 'Cashier',
        serverId:14,
        passcode: 'least',
        id: "Jeff",
        till:"Master",
        isServer:!0,
        isDriver:!1,
        idleTimeout: "10",
    },
    {
        name: "Kathryn",
        userGroup: 'Cashier',
        serverId:15,
        passcode: 'I',
        id: "Kathryn",
        till:"Master",
        isServer:!0,
        isDriver:!1,
        idleTimeout: "10",
    },
    {
        name: "Larry",
        userGroup: 'Cashier',
        serverId:16,
        passcode: 'hope',
        id: "Larry",
        till:"Master",
        isServer:!0,
        isDriver:!1,
        idleTimeout: "10",
    }
];

app.post('/data/get-users-by-search-term', function (req, res) {
    var searchTerm = req.body.searchTerm;
    var items = [
        {
            "id": "ApAdmin",
            "value": "ApAdmin (Group: ADMIN)"
        },
        {
            "id": "yuval",
            "value": "yuval (Group: ADMIN)"
        },
        {
            "id": "Ben",
            "value": "Ben (Group: ADMIN)"
        },
        {
            "id": "Jim",
            "value": "Jim (Group: MANAGER)"
        },
        {
            "id": "Mark",
            "value": "Mark (Group: MANAGER)"
        },
        {
            "id": "Lachelle",
            "value": "Lachelle (Group: MANAGER)"
        },
        {
            "id": "Chance",
            "value": "Chance (Group: MANAGER)"
        }
    ];
    var results = [];
    for (var i = 0; i < items.length; i++) {
        if (items[i].indexOf(searchTerm) > -1 ) {
            results.push(items[i]);
        }
    }
    res.status(200).send({ results: results });
});

app.post('/data/get-tills-list', function (req, res) {
    setTimeout((function () {
        res.status(200).send({ results: tills });
    }), 100);
});

app.post('/data/get-tills', function (req, res) {
    setTimeout((function () {
        res.status(200).send({ results: tills });
    }), 100);
});

app.post('/data/save-till', function (req, res) {
    setTimeout((function () {
        res.status(200).send({ results: { 
            success: true, 
        }});
    }), 100);
});

app.post('/data/get-users', function (req, res) {
    setTimeout((function () {
        res.status(200).send({userData});
    }), 100);
});

companyDetails = {
    companyName : 'myNewCompanyName',
    address1: '1234 Fake Address',
    salesType: 'Food Service',
    city : 'Fake City',
    state : 'Fake State',
    zip : '12345'
}

app.post('/data/get-company-info', function (req, res) {
    setTimeout(( function () {
        res.status(200).send({
            companyDetails
        });
    } ), 100);
});

retailData = {
    'hasSalesReps' : true,
    'priceDecimalNumber': 5,
    'quantityDecimalNumber': 2,
    'totalDecimalNumber' : 4
}

app.post('/data/get-retail-data', function (req, res) {
    setTimeout(( function () {
        res.status(200).send({
            retailData
        });
    } ), 100);
});


app.listen(3002, function () {
    console.log('listening on port 3002');
});


app.post('/data/validate-serial', function (req, res) {
    setTimeout(( function () {
        res.status(200).send({
            'status' : 'GetPassword',
        });
    } ), 100);
});

app.post('/data/login', function (req, res) {
    setTimeout((function () {
        res.status(200).send({
            'status' : 'Success',
            'token' : 'asfasdf234234'
        });
    }), 100);
});

app.post('/data/first-login', function (req, res) {
    setTimeout((function () {
        res.status(200).send({
            'status' : 'Success',
            'token' : 'asfasdf234234'
        });
    }), 100);
});

app.post('/data/save-company-info', function (req, res) {
    setTimeout(( function () {
        res.status(200).send({
            'status' : 'Success',
        });
    } ), 100);
});

app.post('/data/save-retail-data', function (req, res) {
    setTimeout((function () {
        res.status(200).send({ results: { 
            success: true, 
        }});
    }), 100);
});


app.post('/data/save-users', function (req, res) {
    setTimeout((function () {
        res.status(200).send({ results: { 
            'status' : 'Success',
        }});
    }), 100);
});

receiptDetails = {
    "printItemSku" : true,
    "printLogo": true,
    "printCustomerDetails": true,
    "dateTimeFormat": "MM-dd-yy HH:mm",
    "receiptMessage": 'This is my custom message',
    "savingsMessage": 'This is my savings message'
}

app.post('/data/get-receipt-details', function (req, res) {
    setTimeout(( function () {
        res.status(200).send({
            receiptDetails
        });
    } ), 100);
});

navigationData= {
    companyDataCompleted: true,
    retailCompleted: true,
    receiptsCompleted: true,
    itemsCompleted: true,
    usersCompleted: true
}

app.post('/data/get-navigation-data', function (req, res) {
    setTimeout(( function () {
        res.status(200).send({navigationData});
    } ), 100);
});

productLines = [
    {
        id: 0,
        description: "Appetizers",
        itemType: "Food",
        allowDiscount: true,
        isStock: false,
        isScalable: false,
        isSerialized: false,
        noPartialQuantity: true,
        menuPageName: "Kitchen",
        HasChoices: true
    },
    {
        id: 1,
        description: "Non-Food",
        itemType: "Non-Food",
        allowDiscount: true,
        isStock: true,
        isScalable: false,
        isSerialized: true,
        noPartialQuantity: true,
        menuPageName: "Gift Shop",
        HasChoices: false
    },
    {
        id: 2,
        description: "Dinner",
        itemType: "Food",
        allowDiscount: false,
        isStock: false,
        isScalable: false,
        isSerialized: false,
        noPartialQuantity: true,
        menuPageName: "Kitchen",
        HasChoices: true
    },
    {
        id: 3,
        description: "Dessert",
        itemType: "Food",
        allowDiscount: false,
        isStock: false,
        isScalable: false,
        isSerialized: false,
        noPartialQuantity: true,
        menuPageName: "Kitchen",
        HasChoices: false
    },
    {
        id: 4,
        description: "Services",
        itemType: "Services",
        allowDiscount: true,
        isStock: false,
        isScalable: false,
        isSerialized: false,
        noPartialQuantity: true,
        menuPageName: "Gift Shop",
        HasChoices: false
    }
];

app.post('/data/get-productlines', function (req, res) {
    setTimeout(( function () {
        res.status(200).send({productLines});
    } ), 100);
});

app.post('/data/save-productlines', function (req, res) {
    setTimeout((function () {
        res.status(200).send({ results: { 
            'status' : 'Success',
        }});
    }), 100);
});

items = [
    {
        id: 0,
        description: 'Potato Skins',
        price : '4.99',
        productLineId: '0',
        itemCode: '1111049213'
    },
    {
        id: 1,
        description: 'Bear Souvenir',
        price : '10.99',
        productLineId: '1',
        itemCode: '7879585854498965'  
    },
    {
        id: 2,
        description: 'Cheeseburger and fries',
        price : '7.99',
        productLineId: '2',
        itemCode: 'Cheeseburger and fries'
    },
    {
        id: 3,
        description: 'Sundae',
        price : '3.99',
        productLineId: '3',
        itemCode: 'Sundae'
    },
    {
        id: 4,
        description: 'Park Ticket',
        price : '54.99',
        productLineId: '4',
        itemCode: '4036'  
    },
    {
        id: 5,
        description: 'Coater Wrist Band',
        price : '12.99',
        productLineId: '4',
        itemCode: '4440536991'
    },
]

app.post('/data/get-items', function (req, res) {
    setTimeout(( function () {
        res.status(200).send({items});
    } ), 100);
})

app.post('/data/save-items', function (req, res) {
    setTimeout((function () {
        res.status(200).send({ results: { 
            'status' : 'Success',
        }});
    }), 100);
});