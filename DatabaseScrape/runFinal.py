import datetime
import xlsxwriter
import os
import mysql.connector
from tkinter import *
from tkinter import ttk
import numpy as np
import tkinter.messagebox as box

def isFloat(value):
    try:
        float(value)
        return True
    except ValueError:
        return False

def create_server_connection(host_name, user_name, user_password, db):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password,
            database=db
        )
    except:
        box.showwarning('Warning', 'Error connecting to MySQL Database, please try connecting to a VPN or try again later.')
        exit()
    return connection


def execute_many_query(connection, query, list):
    cursor = connection.cursor()
    try:
        cursor.executemany(query, list)
        connection.commit()
        #cursor.close()
        return True
    except:
        return False
    return False

def execute_query(connection, query):
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        connection.commit()
        #cursor.close()
        return True
    except:
        return False
    return False

def read_query(connection, query):
    cursor = connection.cursor()
    result = None
    try:
        cursor.execute(query)
        result = cursor.fetchall()
        return result
    except:
        box.showwarning('Warning', "Error reading query. Please try again later.")
    return result


def getChar(number, location = ""):
    alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    if (number > 25):
        return getChar(int(number/26) - 1, location + alpha[int(number % 26)])
    else:
        return (location + alpha[number])[::-1]

def getCoding(answerArray, answerForm):
    if (answerForm == "matrix"):
        splits = answerArray.split("|")
        headers = splits[0].split(",")
        questions = splits[1].split(",")



def createExcelFile(fileName):

    connection = create_server_connection("esgwebmariadb.jh.edu", "oasis_dev", "b5)frYrH2d7<?&fZ", "oasis_dev")
    # Create a workbook and add a worksheet.
    workbook = xlsxwriter.Workbook(fileName + '.xlsx')
    worksheet = workbook.add_worksheet()

    # Add a bold format to use to highlight cells.
    bold = workbook.add_format({'bold': 1})
    italics = workbook.add_format({'italic': 1})

    # Add a number format for cells with money.
    money_format = workbook.add_format({'num_format': '$#,##0'})

    # Add an Excel date format.
    date_format = workbook.add_format({'num_format': 'mmmm d yyyy'})

    # Adjust the column width.
    worksheet.set_column(1, 1, 15)

    # Write some data headers.
    worksheet.write('A1', 'Variable', bold)
    worksheet.write('B1', 'Date', bold)
    worksheet.write('C1', 'Time', bold)
    worksheet.write('D1', 'Complete', bold)
    worksheet.write('E1', 'UserID', bold)
    worksheet.write('F1', 'Survey_number', bold)
    worksheet.write('G1', 'Survey_version', bold)
    worksheet.write('A2', 'Description', italics)
    worksheet.write('A3', 'Type of Variable')
    worksheet.write('A4', 'Coding')
    worksheet.write('B2', 'Date of completion', italics)
    worksheet.write('C2', 'Time of completion', italics)
    worksheet.write('D2', 'Was this survey completed?', italics)
    worksheet.write('E2', 'The user ID', italics)
    worksheet.write('F2', 'Number of times this user has submitted responses', italics)
    worksheet.write('G2', 'Survey Version', italics)
    worksheet.write('B3', 'String')
    worksheet.write('C3', 'String')
    worksheet.write('D3', 'Numeric')
    worksheet.write('E3', 'String')
    worksheet.write('F3', 'Numeric')
    worksheet.write('G3', 'Numeric')


    query = ("SELECT userID, COUNT(DISTINCT dateCompleted) FROM CompletedSurveys GROUP BY MD5(userID);")
    results = read_query(connection, query)
    count = {}
    for result in results:
        count[result[0]] = result[1]

    query = ("SELECT DISTINCT dateCompleted FROM CompletedSurveys;")
    results = read_query(connection, query)
    uniqueDates = {}
    i = 0
    if (results):
        for name in results:
            uniqueDates[name[0]] = i
            i+=1

    query = ("SELECT * FROM Questions")
    results = read_query(connection, query)
    i, j = 0, 0
    versionArray = []
    tempSurveyVersion = 0
    for result in results:
        id, surveyVersion, question, answerForm, answers, switch = result
        location = ''
        if (surveyVersion != tempSurveyVersion and len(versionArray) < surveyVersion):
            tempSurveyVersion = surveyVersion
            versionArray.append(id)
        elif (surveyVersion != tempSurveyVersion and len(versionArray) >= surveyVersion and versionArray[surveyVersion - 1] < id):
            tempSurveyVersion = surveyVersion
            versionArray[surveyVersion - 1] = id
        elif (surveyVersion == tempSurveyVersion and versionArray[surveyVersion - 1] < id):
            versionArray[surveyVersion - 1] = id

        location = getChar(7 + i)

        if answers == 'Map':
            worksheet.write(location + '1', "v" + str(surveyVersion) + "_" + str(j + 1) + '_lat', bold)
            worksheet.write(getChar(8 + i) + '1', "v" + str(surveyVersion) + "_" + str(j + 1) + '_lng', bold)
            worksheet.write(location + '4', answers)
            worksheet.write(getChar(8 + i) + '4', answers)
            worksheet.write(getChar(8 + i) + '2', question, italics)
            worksheet.write(getChar(8 + i) + '3', answerForm)
            i = i + 1
            worksheet.write(location + '2', question, italics)
            worksheet.write(location + '3', answerForm)
        elif answerForm == "Matrix":
            questions, answers = answers.split("|")
            questions = questions.split(",")
            for x in range(0, len(questions)):
                worksheet.write(getChar(7 + i + x) + '1', "v" + str(surveyVersion) + "_" + str(j + 1) + "_" + str(x + 1), bold)
                worksheet.write(getChar(7 + i + x) + '2', questions[x], italics)
                worksheet.write(getChar(7 + i + x) + '3', answerForm)
                worksheet.write(getChar(7 + i + x) + '4', answers)
            i = i + len(questions) - 1
        else:
            worksheet.write(location + '1', "v" + str(surveyVersion) + "_" + str(j + 1), bold)
            worksheet.write(location + '2', question, italics)
            worksheet.write(location + '3', answerForm)

        if answers != "Change" or answers != "Map" or answerForm != "Matrix":
            worksheet.write(location + '4', answers)

        i = i + 1
        j = j + 1


    versionArray.insert(0, 0)
    row = 4
    column = 1
    query = ("SELECT * FROM CompletedSurveys")
    results = read_query(connection, query)
    skipLocations = []
    for (result) in results:
        id, userID, dateCompleted, surveyVersion, questions, answers, completed = result
        row = uniqueDates[dateCompleted] + 4
        worksheet.write_string(row, 1, dateCompleted.strftime("%m-%d-%Y"))
        worksheet.write_string(row, 2, dateCompleted.strftime("%H:%M:%S"))
        if completed == 'Y':
            worksheet.write_string(row, 3, "complete")
        else:
            worksheet.write_string(row, 3, "partial")
        worksheet.write_number(row, 6, surveyVersion)
        worksheet.write_string(row, 4, userID)
        worksheet.write_number(row, 5, count[userID])
        startCol = 6 + versionArray[surveyVersion - 1]
        matrixVal = False
        if '[' in answers and ']' in answers and ',' in answers:
            matrixVal = True
            answerTemp = answers
            answers = answers[answers.index('[') + 1 : answers.index(']')].split(',')
            for item in answers:
                if not isFloat(item):
                    matrixVal = False
                    answers = answerTemp
        #split location data into lat, lng
        if '(' in answers and ')' in answers and ',' in answers and isFloat(answers[answers.index('(') + 1 : answers.index(',')]) and isFloat(answers[answers.index(',') + 1 : answers.index(')')]):
            tempAdd = 0
            #max value postion less than start col
            if len(skipLocations) != 0:
                generatorSkips = [i for i in skipLocations if i < (startCol + int(questions))]
                if len(generatorSkips) != 0:
                    tempAdd = skipLocations.index(max(generatorSkips)) + 1
            if not ((startCol + int(questions)) in skipLocations):
                skipLocations.append(startCol + int(questions))
            worksheet.write_number(row, startCol + int(questions) + tempAdd, float(answers[answers.index('(') + 1 : answers.index(',')]))
            worksheet.write_number(row, startCol + int(questions) + 1 + tempAdd, float(answers[answers.index(',') + 1 : answers.index(')')]))
        elif matrixVal:
            tempAdd = 0

            #TODO: nneed to fix matrix prints
            #max value postion less than start col
            if len(skipLocations) != 0:
                generatorSkips = [i for i in skipLocations if i < (startCol + int(questions))]
                if len(generatorSkips) != 0:
                    tempAdd = skipLocations.index(max(generatorSkips)) + 1
            if not ((startCol + int(questions)) in skipLocations):
                skipLocations.append(len(answers) - 1 + startCol + int(questions))

            for i in range(0, len(answers)):
                worksheet.write_string(row, startCol + int(questions) + i + tempAdd, answers[i])
        else:
            tempAdd = 0
            #max value postion less than start col
            if len(skipLocations) != 0:
                generatorSkips = [i for i in skipLocations if i < (startCol + int(questions))]
                if len(generatorSkips) != 0:
                    tempAdd = skipLocations.index(max(generatorSkips)) + 1
            worksheet.write_string(row, startCol + int(questions) + tempAdd, answers)
        numQuestions = 0

        row += 1

    workbook.close()
    box.showinfo("Get Completed Surveys (Excel)", "Excel Document Created")


def increase_or_decrease_switch(value, endOfSurvey, increase_or_decrease, next = 0):
    change = 1
    if (increase_or_decrease == "decrease"):
        change = 0 - 1
    value = value.split(",")
    newString = ""
    if endOfSurvey:
        for item in value:
            newString += (str(int(next)) + ',')
        return newString[:-1]
    for item in value:
        if "-1" not in item:
            newString += (str(int(item) + change) + ',')
        else: newString += (str(int(item)) + ',')
    return newString[:-1]

def insertNewQuestion(questions_o, number, surveyVersion, question, answerForm, answers, matrixRow, switch, tree):
    connection = create_server_connection("esgwebmariadb.jh.edu", "oasis_dev", "b5)frYrH2d7<?&fZ", "oasis_dev")
    questions_org = questions_o
    questions = np.array(questions_org)
    answerFormArray = ["Multiple Choice", "Number", "Text", "Multi-Select", "Matrix"]
    if (answerForm == "5"):
        answers = answers + " | " + matrixRow
    max = (read_query(connection, "SELECT MAX(id) FROM Questions WHERE surveyVersion =" + str(surveyVersion)))[0][0]
    #TODO: error handle for when max is zero
    indexOfPrevQuestion = np.argwhere(questions == str(number))
    if max is None: max = 0
    if (max < number): number = max + 1

    for item in indexOfPrevQuestion:
        if (item[1] == 0) and (questions[item[0]][0] == str(number)) and (questions[item[0]][1] == str(surveyVersion)):
            questions_org.insert(item[0], (number, surveyVersion, question, answerFormArray[int(answerForm) - 1], answers, switch))
            if number == max + 1 and (item[0] - 1 > -1):
                questions_org[item[0] - 1][5] = increase_or_decrease_switch(questions_org[item[0] - 1][5], True, "increase", number - 1)
            for indexOfBelow in range(item[0] + 1, len(questions_org)):
                if (surveyVersion == questions_org[indexOfBelow][1]):
                    questions_org[indexOfBelow] = (indexOfBelow + 1, surveyVersion, questions_org[indexOfBelow][2], questions_org[indexOfBelow][3], questions_org[indexOfBelow][4], increase_or_decrease_switch(questions_org[indexOfBelow][5], False, "increase"))

            query = "INSERT INTO Questions VALUES (%s, %s, %s, %s, %s, %s)"
            execute_query(connection, "DELETE FROM Questions")
            execute_many_query(connection, query, questions_org)

            tree.insert("", item[0], values=(number, surveyVersion, question, answerFormArray[int(answerForm) - 1], answers, switch))
            x = tree.get_children()
            i = 0
            for item in x:
                tree.item(item, text="blub", values=questions_org[i])
                i += 1
            box.showinfo("Insert New Question", "Question inserted successfully")
            break
    connection.close()

def insertNewUser(name, idPassword):
    connection = create_server_connection("esgwebmariadb.jh.edu", "oasis_dev", "b5)frYrH2d7<?&fZ", "oasis_dev")
    if (execute_query(connection, "INSERT INTO Logins VALUES ('" + name + "', '" + idPassword + "')")):
        box.showinfo("Insert New User", "User: " + name + ", ID: " + idPassword + " inserted successfully.")
    else: box.showinfo("Insert New User", "User already exists.")
    connection.close()

def deleteAQuestion(questions_o, tree):
    curItem = tree.focus()
    item = tree.item(curItem, 'values')
    connection = create_server_connection("esgwebmariadb.jh.edu", "oasis_dev", "b5)frYrH2d7<?&fZ", "oasis_dev")
    questions_org = questions_o
    questions = np.array(questions_org)
    questionToDelete = item[0]
    item = list(item)
    item[0] = int(item[0])
    item[1] = int(item[1])
    item = tuple(item)
    indexOfSelected = questions_org.index(item)
    surveyVersion = item[1]
    max = (read_query(connection, "SELECT MAX(id) FROM Questions WHERE surveyVersion =" + str(surveyVersion)))[0][0]

    if questionToDelete == max and (indexOfSelected - 1 > -1):
        questions_org[indexOfSelected - 1][5] = increase_or_decrease_switch(questions_org[indexOfSelected - 1][5], True, "decrease", number - 1)
    for indexOfBelow in range(indexOfSelected + 1, len(questions_org)):
        if (surveyVersion == questions_org[indexOfBelow][1]):
            questions_org[indexOfBelow] = (indexOfBelow, surveyVersion, questions_org[indexOfBelow][2], questions_org[indexOfBelow][3], questions_org[indexOfBelow][4], increase_or_decrease_switch(questions_org[indexOfBelow][5], False, "decrease"))

    questions_org.remove(item)
    tree.delete(tree.selection()[0])
    x = tree.get_children()
    i = 0
    for item in x: ## Changing all children from root item
        tree.item(item, text="blub", values=questions_org[i])
        i += 1
    query = "INSERT INTO Questions VALUES (%s, %s, %s, %s, %s, %s)"
    execute_query(connection, "DELETE FROM Questions")
    execute_many_query(connection, query, questions_org)
    connection.close()


def dialog(listbox):
    #box.showinfo('Selection', 'Your Choice: ' + listbox.get(listbox.curselection()))
    if listbox.get(ACTIVE) == 'Get Completed Surveys (Excel)':
        survey = Tk()
        survey.title('Get Completed Surveys (Excel)')
        label = Label(survey, text = 'Enter a File Name')
        label.pack()
        surveyframe = Frame(survey)
        entry = Entry(surveyframe)
        bc = Button(survey, text = "Enter Name", command = lambda: createExcelFile(entry.get()))
        bc.pack(side = BOTTOM, pady = 5)
        entry.pack(side = LEFT)
        surveyframe.pack(padx = 20, pady = 20)
        survey.mainloop()
    elif listbox.get(ACTIVE) == 'Insert New Users':
        newUsers = Tk()
        newUsers.title('Insert New Users')
        Label(newUsers, text = 'Enter a new username').grid(row = 1, column = 1, padx = 2)
        Label(newUsers, text = 'Enter a new ID').grid(row = 2, column = 1, padx = 2)
        entryName = Entry(newUsers)
        entryID = Entry(newUsers)
        Button(newUsers, text = "Submit", command = lambda: insertNewUser(entryName.get(), entryID.get())).grid(row = 3, column = 1, columnspan=2, padx = 2)
        entryName.grid(row = 1, column = 2, padx = 2)
        entryID.grid(row = 2, column = 2, padx = 2)
        newUsers.mainloop()
    elif listbox.get(ACTIVE) == 'Insert New Survey Question':
        root = Tk()
        root.title('Insert New Questions')
        tree = ttk.Treeview(root, column=("c1", "c2", "c3", "c4", "c5", "c6"), show='headings', height = 15)
        label = Label(root, text = 'Current Questions:')

        tree.column("#1", anchor=CENTER)
        tree.heading("#1", text="ID")
        tree.column("#2", anchor=CENTER)
        tree.heading("#2", text="Survey Version")
        tree.column("#3", anchor=CENTER)
        tree.heading("#3", text="Question")
        tree.column("#4", anchor=CENTER)
        tree.heading("#4", text="AnswerForm")
        tree.column("#5", anchor=CENTER)
        tree.heading("#5", text="Answers")
        tree.column("#6", anchor=CENTER)
        tree.heading("#6", text="Switch")

        L1 = Label(root, text="Question Number:")
        E1 = Entry(root, bd =5)
        L2 = Label(root, text="Survey Version: ")
        E2 = Entry(root, bd =5)
        L3 = Label(root, text="Question: ")
        E3 = Entry(root, bd =5)
        L4 = Label(root, text="AnswerForm number: ")
        E4 = Entry(root, bd =5)
        L5 = Label(root, text="Answers (or Matrix Column Headers): ")
        E5 = Entry(root, bd =5)
        L6 = Label(root, text="Skip patterns seperated by a comma: ")
        E6 = Entry(root, bd =5)

        connection = create_server_connection("esgwebmariadb.jh.edu", "oasis_dev", "b5)frYrH2d7<?&fZ", "oasis_dev")
        questions_org = read_query(connection, "SELECT * FROM Questions")
        for row in questions_org:
            tree.insert("", END, values=row)
        connection.close()

        bc = Button(root, text = "Enter", command = lambda: insertNewQuestion(questions_org, int(E1.get()), int(E2.get()), E3.get(), E4.get(), E5.get(), E5_5.get(), E6.get(), tree))

        label2 = Label(root, text="Please enter the following information:")
        label3 = Label(root, text="Notes:\n To use the random number generator, please enter '[random]' in the Question where the random number should be.\n To create a new random number, enter 'Change' in the Answers sectoin.\nAnswers must be seperated by a comma.\nPlease enter the answerForm number:\n 1 - Multiple Choice\n 2 - Number\n 3 - Text\n 4 - Multi-Select\n 5 - Matrix\n")
        label.grid(row = 1, column = 3, columnspan = 2, padx = 2)
        tree.grid(row = 2, column = 1, columnspan = 6, padx = 2, pady = 30)
        label2.grid(row = 3, column = 3, columnspan = 2, padx = 2)
        L1.grid(row = 4, column = 1, padx = 2)
        L2.grid(row = 4, column = 2, padx = 2)
        L3.grid(row = 4, column = 3, padx = 2)
        L4.grid(row = 4, column = 4, padx = 2)
        L5.grid(row = 4, column = 5, padx = 2)
        L6.grid(row = 4, column = 6, padx = 2)
        E1.grid(row = 5, column = 1, padx = 2)
        E2.grid(row = 5, column = 2, padx = 2)
        E3.grid(row = 5, column = 3, padx = 2)
        E4.grid(row = 5, column = 4, padx = 2)
        E5.grid(row = 5, column = 5, padx = 2)
        L5_5 = Label(root, text="Row Headers: ")
        L5_5.grid(row = 6, column = 5, padx = 2)
        E5_5 = Entry(root, bd =5)
        E5_5.grid(row = 7, column = 5, padx = 2)
        E6.grid(row = 5, column = 6, padx = 2)
        bc.grid(row = 8, column = 2, columnspan = 4, padx = 2)
        label3.grid(row = 9, column = 2, padx = 2, columnspan = 4, rowspan = 5)
        root.mainloop()

    elif listbox.get(ACTIVE) == 'Delete A Survey Question':
        root = Tk()
        #TODO DELETE MORE THAN ONE AT A TIME
        root.title('Delete A Question')
        tree = ttk.Treeview(root, column=("c1", "c2", "c3", "c4", "c5", "c6"), show='headings', height = 15)
        label = Label(root, text = 'Current Questions:')
        label.pack()
        tree.column("#1", anchor=CENTER)
        tree.heading("#1", text="ID")
        tree.column("#2", anchor=CENTER)
        tree.heading("#2", text="Survey Version")
        tree.column("#3", anchor=CENTER)
        tree.heading("#3", text="Question")
        tree.column("#4", anchor=CENTER)
        tree.heading("#4", text="AnswerForm")
        tree.column("#5", anchor=CENTER)
        tree.heading("#5", text="Answers")
        tree.column("#6", anchor=CENTER)
        tree.heading("#6", text="Switch")
        tree.pack()

        connection = create_server_connection("esgwebmariadb.jh.edu", "oasis_dev", "b5)frYrH2d7<?&fZ", "oasis_dev")
        questions_org = read_query(connection, "SELECT * FROM Questions")
        for row in questions_org:
            tree.insert("", END, values=row)
        connection.close()
        Button(root, text='Delete Question(s)', command=lambda:deleteAQuestion(questions_org, tree)).pack()
        root.mainloop()
    elif listbox.get(ACTIVE) == 'Update A Question':
        root = Tk()
        #TODO DELETE MORE THAN ONE AT A TIME
        root.title('Update Questions')
        tree = ttk.Treeview(root, column=("c1", "c2", "c3", "c4", "c5", "c6"), show='headings', height = 15)
        label = Label(root, text = 'Current Questions:')
        label.pack()
        tree.column("#1", anchor=CENTER)
        tree.heading("#1", text="ID")
        tree.column("#2", anchor=CENTER)
        tree.heading("#2", text="Survey Version")
        tree.column("#3", anchor=CENTER)
        tree.heading("#3", text="Question")
        tree.column("#4", anchor=CENTER)
        tree.heading("#4", text="AnswerForm")
        tree.column("#5", anchor=CENTER)
        tree.heading("#5", text="Answers")
        tree.column("#6", anchor=CENTER)
        tree.heading("#6", text="Switch")
        tree.pack()

        connection = create_server_connection("esgwebmariadb.jh.edu", "oasis_dev", "b5)frYrH2d7<?&fZ", "oasis_dev")
        questions_org = read_query(connection, "SELECT * FROM Questions")
        for row in questions_org:
            tree.insert("", END, values=row)
        connection.close()
        Button(root, text='Update Question(s)', command=lambda:updateQuestions(tree)).pack()
        root.mainloop()
    else: exit()

def updateQuestions(tree):
    connection = create_server_connection("esgwebmariadb.jh.edu", "oasis_dev", "b5)frYrH2d7<?&fZ", "oasis_dev")
    questions_org = []
    for child in tree.get_children():
        questions_org.append(tuple(tree.item(child)["values"]))
    query = "INSERT INTO Questions VALUES (%s, %s, %s, %s, %s, %s)"
    execute_query(connection, "DELETE FROM Questions")
    execute_many_query(connection, query, questions_org)
    connection.close()

def main():
    window = Tk()
    window.title("Oasis Lighthouse Programs")
    frame = Frame(window)
    listbox = Listbox(frame)
    listbox.insert(1, 'Get Completed Surveys (Excel)')
    listbox.insert(2, 'Insert New Users')
    listbox.insert(3, 'Insert New Survey Question')
    listbox.insert(4, 'Delete A Survey Question')
    listbox.insert(5, 'Close')

    label = Label(window, text = 'Menu Options')
    label.pack(padx = 100, pady = 20)

    choose = Button(window, text = "Enter", command = lambda: dialog(listbox))

    choose.pack(side = BOTTOM, padx = 10, pady = 50)
    listbox.pack()
    frame.pack(padx = 30, pady = 20)
    window.mainloop()

if __name__ == '__main__':
    main()
