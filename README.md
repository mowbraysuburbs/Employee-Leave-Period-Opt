# Public_Holiay_Deductions

## SUMMARY 

The objective of the project to determine best days to begin your leave the for a specific leave day period for the next five years. This is recommended for employees that want to maximum their leave period by using hte least amount of annual leave. Sources data from the Calenderific API to determine public holidays of South Africa. Utilities python and SQL to manipulate data. Code was done on Google Colab

## OBJECTIVES
- Determine which year has the highest number weekday public holidays 
- Find the most annual leave-day reduction for a 3,5 and 7 leave day period

## SCOPE AND LIMITATIONS
- Only considers the national public holidays of South Africa
- Year period limited to five years can be adjusted if required

## FINDINGS
- Weekday public holidays range is between 10-11 for the next 5 years.  
- Difference in holiday count may be due to some national holidays occuring on a Saturday.
- Total weekday public holiday range when December weekday public holidays is exluded is 8-9 days.
- Generally, leave should be taken in the months of March, April and December
- For 3-day leave period, it is recommended that you take leave on Friday or Saturday
- For 5-day leave period, it is recommended that you take leave between Wednesday and Saturday
- For 7-day leave period, the strategy is to take leave in March/April or December where the leave period lies over 1-2 public holidays.

## RECOMMENDATIONS & FURTHER RESEARCH
- Look at other countries especially non-secular countries
- Longer year period to identify any patterns

## BUGS & REQUIRED FIXES
- interactive catplot heatmaps not showing. File needs to be downloaded first and run thru notebook (e.g. Google Colab)
- Fix general spelling
- Colour gradient of heatmaps can be confusion at times
