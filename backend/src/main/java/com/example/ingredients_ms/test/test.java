package com.example.ingredients_ms.test;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class test {
    @GetMapping("/test")
    public String test() {
        return "test!!!";
    }
}
