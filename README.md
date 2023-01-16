# Employee Leave Period Optimiser Heatmap


<p align="center">
  <img src="https://user-images.githubusercontent.com/60255967/196750554-2fd4254c-5e23-458a-a8b4-721533b0b5c2.png" />
</p>

<p align="center">
A script for South African employees seeking the longest vacation possible using the least amount of annual leave days. 
</p>

<p align="center">
(APPROVAL OF LEAVE NOT INCLUDED)
</p>


## Table of Contents
- [Introduction](#introduction)
- [Technologies](#technologies)
- [How to Use](#how-to-use) 
	- [Examples](#examples)
	- [Tips](#tips)
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

- Choose the number of leave days you would like to use
- The year is automatically set to the current year but can be changed if needed
```python
#input parameters
current_year = int(datetime.datetime.now().date().strftime("%Y"))
no_of_leave_days = "How many leave days are you willing to use?"
```

## How to Use

If you don't want to use the script, there is an infographic for the current year using 0 - 3 annual days in the output folder.

![2022_Annual_Leave_Days_3](https://user-images.githubusercontent.com/60255967/196751285-b93b095e-6611-49fb-adf0-b0d54bd5614b.png)
- **Colour bar (far right):** total number of days off range
- **Blocks in calendar heatmap:**
	- **Number** - date 
	- **Colour** - the total number of leaves days you receive if you start your leave on that block (Refer to colour bar)

### Examples
For employees willing to use **_3 annual days_**:

-   If you start your leave from the **16th June 2022**:
    -   you get **6 days off**. 
    - 	Leave will start on the **16th June 2022**
    -   return to work on the **22nd June 2022**.

-   If you start your leave from the **21st March 2022**:
    -   you get **4 days off.** 
    - 	Leave will start on the **16th June 2022**
    -   return to work on the **25th March 2022**.

### Tips
- Start with 'no_of_leave_days' = 0 to see how many days off you can get without using any leave. 

## How it Works
The scripts assumes the South African employee works five days a week and takes the the weekends (Saturday and Sunday) off. Additionally, the assumption is that the company gives leave based on  **[South African public holidays](https://www.gov.za/about-sa/public-holidays)**.

For each day, the script checks the starting leave day and the following days whether it is a working day/public holiday/weekend. If it is a working day, the chosen annual leave days are deducted by one until there are no days left. 

If the day is a public holiday/weekend, the total days off is increased by one (Refer to function: '*total_days_off_sql*'). This can be summarised in the equation shown below:

<p align="center">
Total Days Off = no. of Weekends + no. of Public Holidays + total no. of Annual leave days
</p>


A summary of the script can be seen in the image below. 

![script layout](https://user-images.githubusercontent.com/60255967/196541268-e240c2bd-5f5d-4534-acb7-639b9a4a35d5.png)
## Known Issues
- **[July](https://pypi.org/project/july/)'s** Heatmap's days off colour bar can be confusion at times as it sometimes show float data types (e.g. 1.2, 1.4, 5.6, etc) when days should be integers. Additionally, the numbers at times are slightly offset from its designate colour.
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
