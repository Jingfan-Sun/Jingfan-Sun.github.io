---
layout: notes
category: notes
tag: [tech_tips]
title: "How to convert from Latitude and Longitude to Address"
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2018-02-23-lat-long-to-address-cover.png"
---

#### Introduction

We got a dataset with latitude and longitude data from multiple locations. The task is to convert these data and show the address (street, city, county, etc.) for these locations.

#### Approach

We will use R and Google Maps api to get it done. Here is a [sample dataset](https://ambaboo-github-io-assets.s3.amazonaws.com/2018-02-23-lat-long-to-address-Bubble_locations.csv).

{% highlight R linenos %}
library(ggmap)
library(dplyr)
library(magrittr)
# Read csv file with ',' seperation
df = read.table("./Bubble_locations.csv", header=TRUE, sep=",")
# Add one new column name 'Address'
df["Address"] <- NA
# Loop over df rows
for (i in 1: nrow(df)) {
# ggmap api may fail to get data, do it until succeed
  while (is.na(df$Address[i])) {
# The address fot from revgeocode() function is a string
    df$Address[i] <- revgeocode(c(df$Lat[i], df$Long[i]))
  }
}
data = df
# seperate the string with sep ','. Note: if there are not enough pieces, fill with missing values on the left
data %<>% separate(Address,c("street_address", "city","county","country"),remove=F,sep=",",fill = "left")
# Delete the column 'Address'
data$Address <- NULL
# Output
write.csv(data, file = "./Bubble_locations_updated.csv")
{% endhighlight %}