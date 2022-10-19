# Employee Leave Period Optimiser Heatmap

## A script for South African employees who want the longest vacation possible using the least amount of annual leave days. 

## Table of Contents
- [Introduction](#introduction)
- [Technologies](#technologies)
- [Usage](#usage) 
- [How it works](#how-it-works)
- [Known Issues](#known-issues)
- [References](#references)

## Introduction
Are you a tired South African employee looking to take a few days off but only have a few annual leave days? Then look no further! I developed a Python script which determines the best time to take leave in the year based on the total number of annual leave days you are willing to use. 

## Technologies
- Python 
- SQL 
- Jupyter

## Setup 
- Install all relevant Python packages
- Create your own API key by creating a free account with [Calendarific](https://calendarific.com/login)
- Paste API key by 'key' variable situated in 'holiday_data_from_api' function
```python
def holiday_data_from_api(current_year):
	key = 'insert your own API key here'
```

- Choose the number of leave days you would like to use (Note, must be greater than zero!)
- The year is automatically set to the current year but can be changed if needed
```python
#input parameters
current_year = int(datetime.datetime.now().date().strftime("%Y"))
no_of_leave_days = 3
```

## Usage

![heatmap](https://user-images.githubusercontent.com/60255967/196540741-4c997f13-c14b-4349-971e-65d6cf3461b4.png)

- **Colour bar (far right):** total number of days off range
- **Blocks in calendar heatmap:**
	- **Number** - date 
	- **Colour** - the number of leaves days (Refer to colour bar)

**Examples:** 

For employees willing to use *3 annual days*:

- If you start your leave from the *16th June 2022*, you get *6 days off*. Leave will start on the *16th June 2022* and you will return to work on the *22nd June 2022*.
- If you start your leave from the *21st March 2022*, you get *4 days off.* Leave will start on the *16th June 2022* and you will return to work on the *25th March 2022*.

## How it Works
The scripts assumes the South African employee works five days a week and takes the the weekends (Saturday and Sunday) off. Additionally, the assumption is that the company gives leave based on  **[South African public holidays](https://www.gov.za/about-sa/public-holidays)**.

For each day, the script checks whether it is a working day/public holiday/weekend. If it is a working day, the chosen annual leave days are deducted by one until there are no days left. 

If the day is a public holiday/weekend, the total days off is increased by one (Refer to function: '*total_days_off_sql*'). This can be summarised in the equation shown below:

**Total Days Off = no. of Weekends + no. of Public Holidays + total no. of Annual leave days**


A summary of the script can be seen in the image below. 
![script layout](https://user-images.githubusercontent.com/60255967/196541268-e240c2bd-5f5d-4534-acb7-639b9a4a35d5.png)

## Known Issues
- [July](https://pypi.org/project/july/)'s Heatmap's days off colour bar can be confusion at times as it sometimes show float data types (e.g. 1.2, 1.4, 5.6, etc) when days should be integers.
- Chosen leave days has to be greater than **zero** otherwise script will break
- Keep number of leave days relatively small (< 10 days) for reasonable values

## References
- **[July Documentation](https://pypi.org/project/july/)**
- **[Calendarific](https://calendarific.com/)**
- **[Create date range with Pandas](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.date_range.html)**
- **[Python Check if Date is Weekend or Weekday](https://www.itsolutionstuff.com/post/python-check-if-date-is-weekend-or-weekday-exampleexample.html)**
- **[Continuous Color Scales and Color Bars in Python](https://plotly.com/python/colorscales/)**
- **[Public holidays in South Africa](https://www.gov.za/about-sa/public-holidays)**

*(Return to [Table of Contents](#table-of-contents))*

---
