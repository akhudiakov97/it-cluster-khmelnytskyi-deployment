package com.itcluster.backendkotlin

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import java.util.concurrent.atomic.AtomicReference

@Component
class CryptoApiClient(
    private val objectMapper: ObjectMapper
) {

    companion object {
        private const val KRAKEN_API_URL = "https://api.kraken.com/0/public/Ticker?pair="
        private val CRYPTO_PAIRS = listOf("XBTUSD", "ETHUSD", "SOLUSD")
    }

    private val restTemplate = RestTemplate()
    private val latestCryptoData = AtomicReference<Map<String, Any>>(emptyMap())

    @Scheduled(fixedRate = 5000) // Runs every 5 seconds
    fun fetchCryptoData() {
        try {
            val queryPairs = CRYPTO_PAIRS.joinToString(",")
            val url = KRAKEN_API_URL + queryPairs
            val response = restTemplate.getForObject(url, String::class.java)
            val jsonMap = objectMapper.readValue(response, Map::class.java) as Map<String, Any>
            if (jsonMap.containsKey("result")) {
                latestCryptoData.set(jsonMap["result"] as Map<String, Any>)
            }
        } catch (e: Exception) {
            // Log the exception (e.g., using SLF4J) or handle it as needed
            println("Error fetching crypto data: ${e.message}")
        }
    }

    fun getLatestCryptoData(): String {
        return objectMapper.writeValueAsString(latestCryptoData.get())
    }
}
