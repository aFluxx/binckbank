<template>
    <v-data-table
        :headers="headers"
        :items="items"
        :items-per-page="15"
        :custom-sort="customSort"
        class="elevation-1"
    >
        <template v-slot:[`item.quote`]="{ item }">
            <v-chip :color="getColor(calculatePercentageDiff(item.quote))" dark>
                {{
                    "last" in item.quote
                        ? calculatePercentageDiff(item.quote).toFixed(2)
                        : "Kan niet berekenen"
                }}%
            </v-chip>
        </template></v-data-table
    >
</template>

<script>
export default {
    props: ["items"],

    data() {
        return {
            headers: [
                { text: "Identifier", value: "id" },
                { text: "Company", value: "name" },
                { text: "Ticker", value: "symbol" },
                { text: "% change", value: "quote" },
                { text: "Currency", value: "currency" },
            ],
        };
    },

    methods: {
        customSort(items, index, isDescending) {
            items.sort((a, b) => {
                if (index[0] === "quote") {
                    if (isDescending[0]) {
                        return this.diff(
                            b[index].last.price,
                            b[index].close.price
                        ) < this.diff(a[index].last.price, a[index].close.price)
                            ? -1
                            : 1;
                    } else {
                        return this.diff(
                            a[index].last.price,
                            a[index].close.price
                        ) < this.diff(b[index].last.price, b[index].close.price)
                            ? -1
                            : 1;
                    }
                } else {
                    if (!isDescending[0]) {
                        return a[index[0]] > b[index[0]] ? 1 : -1;
                    } else {
                        return b[index[0]] > a[index[0]] ? 1 : -1;
                    }
                }
            });
            return items;
        },

        calculatePercentageDiff(quote) {
            try {
                if (quote.last) {
                    return this.diff(quote.last.price, quote.close.price);
                }
            } catch (err) {
                console.log(err);
            }
        },

        diff(last, close) {
            return ((last - close) / close) * 100;
        },

        getColor(percentageDiff) {
            if (percentageDiff < 0) {
                return "red";
            } else if (percentageDiff == 0) {
                return "orange";
            } else {
                return "green";
            }
        },
    },
};
</script>
