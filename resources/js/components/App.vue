<template>
    <v-app>
        <v-navigation-drawer app permanent>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title class="title">
                        BinckBonK
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>

            <v-list dense nav>
                <v-list-item link :key="'setup'">
                    <v-list-item-content>
                        <v-btn
                            :color="
                                accountSetupReady ? 'green lighten-1' : 'error'
                            "
                            depressed
                            @click="setUpAccount"
                            :disabled="accountSetupReady"
                        >
                            <span v-text="'Setup account'"></span>
                        </v-btn>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item link :key="'percentages'" v-if="accountSetupReady">
                    <v-list-item-content>
                        <v-btn
                            :color="
                                percentagesReady ? 'green lighten-1' : 'error'
                            "
                            depressed
                            @click="getPercentages"
                            :disabled="isGettingIds"
                        >
                            <span v-text="'Get Instrument IDS'"></span>
                        </v-btn>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item link :key="'quotes'" v-if="percentagesReady">
                    <v-list-item-content>
                        <v-btn color="primary" depressed @click="getQuotes">
                            <span v-text="'Get Quotes'"></span>
                        </v-btn>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar app>
            <v-btn
                color="primary"
                depressed
                id="idBtnLoginOrLogout"
                class="mr-2"
                @click="login"
            >
                Sign in
            </v-btn>
            <span class="mr-4">Bearer:</span> <span id="idBearerToken">-</span>
        </v-app-bar>

        <v-main>
            <v-container fluid>
                <special-table
                    :items="instrumentIds"
                    v-if="dataReady"
                ></special-table>
            </v-container>
        </v-main>

        <v-footer app> </v-footer>
    </v-app>
</template>

<script>
import moment from "moment";
import Api from "../class/Api";
import Quotes from "../class/Quotes";
import Server from "../class/Server";
import Version from "../class/Version";
import Accounts from "../class/Accounts";
import SpecialTable from "./SpecialTable.vue";
import Instruments from "../class/Instruments";

import { stocks } from "../data/stocks";

export default {
    data() {
        return {
            accountSetupReady: false,
            percentagesReady: false,
            dataReady: false,
            configurationFromBackend: null,

            isGettingIds: false,

            instrumentIds: [],
        };
    },

    computed: {
        commaIds() {
            let list = [];

            this.instrumentIds.forEach((instrument) => {
                list.push(instrument.id);
            });

            return list;
        },
    },

    components: {
        SpecialTable,
    },

    methods: {
        initPage(configData) {
            this.configurationFromBackend = configData;
            Api.configurationFromBackend = configData;
            Api.checkState();

            window.setInterval(this.displayVersions, 45 * 1000);
            this.displayVersions();
        },

        displayVersions() {
            function displayApiVersion() {
                Version.getVersion(function (data) {
                    var newTitle =
                        "API " +
                        data.currentVersion +
                        " (" +
                        new Date(data.buildDate).toLocaleString() +
                        ")";
                    console.log(
                        "Received api version " +
                            data.currentVersion +
                            " build @ " +
                            new Date(data.buildDate).toLocaleString() +
                            ", request time " +
                            new Date(data.metadata.timestamp).toLocaleString()
                    );
                    if (document.title !== newTitle) {
                        document.title = newTitle;
                    }
                });
            }

            displayApiVersion();
        },

        login() {
            Api.navigateToLoginPage();
        },

        async setUpAccount() {
            await Accounts.setUpAccount();

            this.accountSetupReady = true;
        },

        OneDayAgo(date) {
            return moment(date, "x").isSame(moment().subtract(1, "day"), "day");
        },

        async getPercentages() {
            await this.fetchPercentages();

            this.percentagesReady = true;
            console.log(this.instrumentIds);
            window.localStorage.setItem(
                "instrumentIds",
                JSON.stringify(this.instrumentIds)
            );
            window.localStorage.setItem("instrumentIdsLastPushed", Date.now());
        },

        async fetchPercentages() {
            const unixTimeStampLastPushed = window.localStorage.getItem(
                "instrumentIdsLastPushed"
            );

            if (
                !unixTimeStampLastPushed ||
                this.OneDayAgo(unixTimeStampLastPushed)
            ) {
                this.isGettingIds = true;

                for (let i = 0; i < stocks.length; i++) {
                    await Instruments.findByIsin(
                        stocks[i].isin,
                        null,
                        "equity",
                        Accounts.accountNumber
                    ).then((res) => {
                        res.instrumentsCollection.instruments.forEach(
                            (instrument) => {
                                let obj = {
                                    name: instrument.name,
                                    symbol: instrument.symbol,
                                    id: instrument.id,
                                    currency: instrument.currency,
                                };
                                this.instrumentIds.push(obj);
                            }
                        );
                    });
                }
            } else {
                this.isGettingIds = true;
                this.instrumentIds = JSON.parse(
                    window.localStorage.getItem("instrumentIds")
                );
                this.percentagesReady = true;
            }
        },

        async getQuotes() {
            await this.fetchLatestQuotes();

            this.dataReady = true;
        },

        async fetchLatestQuotes() {
            var iterations = this.commaIds.length / 50;
            var iteration = 1;

            for (let i = 0; i < iterations; i++) {
                var firstIterable = i == 0 ? 0 : i;

                await Quotes.getLatestQuotes(
                    Accounts.accountNumber,
                    this.commaIds.slice(firstIterable * 50, iteration * 50),
                    "tradesOnly"
                )
                    .then((res) => {
                        res.quotesCollection.quotes.forEach((quote) => {
                            this.instrumentIds.forEach((instrument) => {
                                if (instrument.id == quote.instrumentId) {
                                    instrument.quote = quote;
                                }
                            });
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });

                iteration++;
            }
        },
    },

    mounted() {
        Server.getDataFromServer({
            requestType: "config",
        })
            .then((res) => res.json())
            .then((res) => {
                this.initPage(res);
            });
    },
};
</script>
