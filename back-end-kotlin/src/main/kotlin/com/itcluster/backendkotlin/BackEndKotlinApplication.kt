package com.itcluster.backendkotlin

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@EnableScheduling
@SpringBootApplication
class BackEndKotlinApplication

fun main(args: Array<String>) {
    runApplication<BackEndKotlinApplication>(*args)
}
