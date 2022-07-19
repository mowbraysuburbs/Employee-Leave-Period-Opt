# Employee Leave Period Optimisation

## SUMMARY 
The objective of the project to determine best days to begin your leave the for a specific leave day period for the next five years. This is recommended for employees that want to maximum their leave period by using the least amount of annual leave days. Sources data from the Calenderific API to determine public holidays of South Africa. Utilities python and SQL to manipulate data. Code was done on Google Colab.

## BACKGROUND
Generally, when employees want to take a few days off from work, they will have to book in leave with their company. Generally, they will use two strategies to use the least amount annual leave days and get the longest leave period as far as reasonably possible:

- Start their leave near the weekend.
- Start their leave near a national public hoiday

The best approach is to have your leave where both of these strategies.

## OBJECTIVES
- Determine which year has the highest number weekday public holidays 
- Find the most annual leave-day reduction for a 3,5 and 7 leave day period

## SCOPE AND LIMITATIONS
- Only considers the national public holidays of South Africa
- Year period limited to five years can be adjusted if required

## FINDINGS
- Weekday public holidays range is between 10-11 for the next 5 years.  
- Difference in holiday count may be due to some national holidays occuring on a Saturday.
- Total weekday public holiday range when December weekday public holidays is exluded is 7-9 days.
- Generally, leave should be taken in the months of March, April and December
- For 3-day leave period, it is recommended that you take leave on Friday or Saturday
- For 5-day leave period, it is recommended that you take leave between Wednesday and Saturday
- For 7-day leave period, the strategy is to take leave in March/April or December where the leave period lies over 1-2 public holidays.
- When a public holiday occurs on Saturday stay in the same position
- Sunday public holidays get celebrated on Monday and counts as public holiday
- Holidays can occur on the same day e.g. Christmas day and Day of Goodwill in year 2022

## RECOMMENDATIONS & FURTHER RESEARCH
- Look at other countries especially non-secular countries
- Longer year period to identify any patterns
- Create website where one can interact with the calender heat map 

## BUGS & REQUIRED FIXES
- Interactive catplot heatmap not showing. File needs to be downloaded first and run thru notebook (e.g. Google Colab)
- General spelling
- Colour bar gradient of heatmaps can be confusion at times as it sometimes show float data types when days should be integers. 
