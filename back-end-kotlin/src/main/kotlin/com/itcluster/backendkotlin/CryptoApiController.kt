package com.itcluster.backendkotlin

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class CryptoApiController(
    private val cryptoApiClient: CryptoApiClient
) {
    @GetMapping("/crypto")
    fun getCrypto(): String = cryptoApiClient.getLatestCryptoData()
}
