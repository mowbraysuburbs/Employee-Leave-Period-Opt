import pandas as pd
import numpy as np
import requests
import datetime
import sqlite3
from datetime import timedelta
from flask import Flask
import jsonify

#input parameters
year = 2024
leave_days = 5
country = "za"

def holiday_data_from_api(year):

    API_base_url = 'https://calendarific.com/api/v2/'
    key = 'cf72f7a27c36a4eb76d3fada7fa90913ea6fd6bf'
    API_endpoints = "holidays"
    endpoint_parameter = "za" #choose countries here

    #Lists for dataframe
    calender_date = [] 
    holiday_name = [] 
    holiday_type = [] #public holiday/observance/etc

    for year in [year, year+1]: 

        api_key = f"{API_base_url}{API_endpoints}?&api_key={key}&country={endpoint_parameter}&year={year}"
        response = requests.get(api_key)
        holiday_data_api = response.json()
        holiday_data_api_refined = holiday_data_api['response']['holidays']

        for i in range(len(holiday_data_api_refined)): #adds to list

            calender_date.append(holiday_data_api_refined[i]['date']["iso"][:10]) #10 is length of date 
            holiday_name.append(holiday_data_api_refined[i]['name'])
            holiday_type.append((holiday_data_api_refined[i]["type"][0]))

    holiday_df = pd.DataFrame({
            "date": calender_date, 
            "holiday_name": holiday_name,
            "holiday_type":holiday_type,
              })

    #adding day name to dataframe
    holiday_df.insert(1,"weekday", 
                    pd.to_datetime(calender_date).strftime("%A"))

    return holiday_df

def calender(year): 

    dates_df = pd.DataFrame({"date": pd.date_range(
                        start = f'{year}-01-01', 
                        periods = 366*2)}) #leap years

    dates_df['weekday'] = dates_df['date'].dt.day_name()

    weekday_or_weekend = [] 

    for weekno in dates_df["date"]:

        weekno = weekno.weekday()

        if weekno < 5: #weekdays index values is 0,1,2,3,4
            weekday_or_weekend.append("Weekday")
        else: # 5 Sat, 6 Sun  
            weekday_or_weekend.append("Weekend")

    dates_df["weekday_type"] = weekday_or_weekend

    #Converts date column type to string
    dates_df["date"] = dates_df["date"].astype(str)

    return dates_df

def total_days_off_sql(year, leave_days):

    conn = sqlite3.connect('holiday&dates_db')
    c = conn.cursor()

    holiday_db = holiday_data_from_api(year).to_sql('holiday', 
                                        conn, if_exists='replace', 
                                        index = False
                                        )

    date_db = calender(year).to_sql('dates', 
                                        conn, 
                                        if_exists='replace', 
                                        index = False,
                                        )

    conn.commit()
        
    leave_day_lives = leave_days 
    leave_day_count= 0 #result for heatmap  
    total_leave_period = [] #array for heatmap

    for date in calender(year)["date"]:    
        
        #shifts dates until leaves days are depleted
        date_shifter = datetime.datetime.strptime(date, '%Y-%m-%d').date() 
        
        while leave_day_lives >= 0:

            c.execute('''
                SELECT DISTINCT dates.date, dates.weekday_type,holiday.holiday_name
                FROM dates
                LEFT JOIN holiday
                ON dates.date = holiday.date
                WHERE dates.date = ?
                AND (holiday.holiday_type = "National holiday" OR dates.weekday_type = "Weekend")                       
                ''',(str(date_shifter),))
            
            potential_dayoff = c.fetchall()
            
            if len(potential_dayoff) == 0:
                leave_day_lives -= 1

                if leave_day_lives < 0:
                    total_leave_period.append(leave_day_count)
                    leave_day_count= 0
                    leave_day_lives = leave_days
                    break

                else:
                    leave_day_count += 1
                    date_shifter += timedelta(days = 1)
                    
            if len(potential_dayoff) > 0:
                leave_day_count +=1
                date_shifter += timedelta(days = 1)

    return total_leave_period

# print(total_days_off_sql(year, leave_days))
# print(calender(year))
# print( holiday_data_from_api(year) )

colours = {
 0: "white",
 1: "pinkish-tone",
 2: "warm-peach",
 3: "light-aqua",
 4: "muted-pink",
 5: "soft-lavender",
 6: "serene-blue",
 7: "warm-peach-tone",
 8: "vibrant-pink",
 9: "pale-yellow",
 10: "green",
 11: "blue",
}
    

conn = sqlite3.connect('holiday&dates_db')
c = conn.cursor()

date = calender(year)
final = pd.DataFrame()

for day in range(0,leave_days):
    date['leave_days'] = day
    date['total_leave'] = total_days_off_sql(year, day)
    date['colour'] =  date['total_leave'].map(colours)
    final = pd.concat([final, date], ignore_index=True)

print(final)

leave_db = final.to_sql('leave_days_za', 
            conn, 
            if_exists='replace', 
            index = False
            )

number = 1
conn.commit()


c.execute(f"SELECT * FROM leave_days_za WHERE leave_days = {number}")
data = c.fetchall()

# print(data)

conn.close()

                            