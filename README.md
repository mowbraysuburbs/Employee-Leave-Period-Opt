# Employee Leave Period Optimisation

## SUMMARY 
The objective of the project to determine the best days to begin your leave the for a specific leave day period in South Africa. This is recommended for employees that want to maximise their leave period by using the least amount of their annual leave days. The scripts scrapes data from the Calenderific API to determine public holidays of South Africa. Uses Python and SQL to transform and load data. Various visualisations are provided. Script was done on Google Colab. Example of the output is shown in image below.

![both](https://user-images.githubusercontent.com/60255967/182039139-0eb7340e-71e5-4b81-b923-17855908692d.PNG)

## BACKGROUND
Generally, when employees want to take a few days off from work, they will have to book in leave with their company. Two main strategies are used in order to use the least amount annual leave days and subsequently get the longest leave period as far as reasonably possible:

1) Start their leave near the weekend (Saturday and Sunday).
2) Start their leave near a national public holiday

The best approach is to plan your leave using both of these strategies. Thus the equation for total annual leave required is the following:

Total Annual Leave = Leave Period - Weekend/s - Public Holiday/s 

## OBJECTIVES
- Determine which year has the highest number weekday public holidays 
- Find the most annual leave-day reduction for a 3,5 and 7 leave day period for various years

## SCOPE AND LIMITATIONS
- Only considers the national public holidays of South Africa
- Year period limited to five years. Can be adjusted if required

## FINDINGS
- Total weekday national public holidays per a year ranges between 10-11 for the next 5 years.  
- Difference in total national  public holiday count may be due to some national holidays occurring on a Saturday.
- Total weekday national public holidays per a year when December weekday public holidays are excluded is between 7-9 days.
- Generally, leave should be taken in the months of March, April and December
- For 3-day leave period, begin your leave on Friday or Saturday if public holiday cannot be used 
- For 5-day leave period, begin your leave on between Wednesday and Saturday  if public holiday cannot be used 
- For 7-day leave period, the strategy is to take leave in March/April or December where the leave period lies over 1-2 public holidays.
- When a public holiday occurs on Saturday, it remains the same position
- Sunday public holidays get celebrated on Monday and thus  counts as a public holiday
- Holidays can occur on the same day e.g. Christmas day and Day of Goodwill in year 2022

## RECOMMENDATIONS & FURTHER RESEARCH
- Look at other countries especially non-secular countries
- Longer year period to identify any patterns
- Create website where one can interact with the calender heat map 

## BUGS & REQUIRED FIXES
- Interactive catplot heatmap not showing. File needs to be downloaded first and run thru notebook (e.g. Google Colab)
- General spelling errors
- Colour bar gradient of heatmaps can be confusion at times as it sometimes show float data types when days should be integers. 
